/* ふっかつのじゅもん型 進捗復元コード(エンコード/デコード)。
 * 医療問題データには一切依存しない、純粋なバイト変換ロジックのみ。
 * ブラウザでは window.RevivalCode として、Node.js では module.exports として使える(UMD風)。
 *
 * 仕様(概要。詳細はブリーフ/コミットメッセージ参照):
 *   entries = [{id, choiceIndex}, ...] (idで昇順ソート)
 *   payload = [0x01(version)] + entries各3byte([idHi, idLo, choiceIndex])
 *   frame   = payload + checksum16(payload)を2byte(big-endian)
 *   payload部分のみ OBFUSCATION_KEY でXOR撹拌 → BigInt(big-endian) → 62進数文字列 → 5文字ごとに'-'区切り
 */
(function (root, factory) {
  "use strict";
  if (typeof module === "object" && typeof module.exports === "object") {
    module.exports = factory();
  } else {
    root.RevivalCode = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  var OBFUSCATION_KEY = [0x5A, 0xC3, 0x91, 0x2E];
  var ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  var BASE = BigInt(ALPHABET.length);
  var VERSION_BYTE = 0x01;
  var CHUNK_SIZE = 5;

  // 自己防御: version byte が撹拌後も非ゼロになることを起動時に確認する。
  // (仕様上、versionByte=1固定・OBFUSCATION_KEY[0]!=0x01であれば常に非ゼロになる)
  if (((VERSION_BYTE ^ OBFUSCATION_KEY[0]) & 0xFF) === 0) {
    throw new Error(
      "RevivalCode: OBFUSCATION_KEY[0] が version byte(0x01) と一致しており、" +
      "撹拌後に先頭バイトが0になります。鍵を変更してください。"
    );
  }

  // ---------- checksum16 (CRCではない。仕様で固定されたアルゴリズム) ----------
  function checksum16(bytes) {
    var h = 0x811c;
    for (var i = 0; i < bytes.length; i++) {
      h = ((h * 33) ^ bytes[i]) & 0xFFFF;
    }
    return h; // 0-65535
  }

  // ---------- バイト配列 <-> BigInt ----------
  function bytesToBigInt(bytes) {
    var n = 0n;
    for (var i = 0; i < bytes.length; i++) {
      n = (n << 8n) | BigInt(bytes[i] & 0xFF);
    }
    return n;
  }

  // BigInt -> 最小バイト表現(先頭が非ゼロバイトである前提で使う)。
  function bigIntToMinimalBytes(n) {
    if (n < 0n) return null;
    if (n === 0n) return [0];
    var hex = n.toString(16);
    if (hex.length % 2 === 1) hex = "0" + hex;
    var bytes = [];
    for (var i = 0; i < hex.length; i += 2) {
      bytes.push(parseInt(hex.substr(i, 2), 16));
    }
    return bytes;
  }

  // ---------- BigInt <-> 62進数文字列 ----------
  function bigIntToBase62(n) {
    if (n === 0n) return ALPHABET[0];
    var s = "";
    while (n > 0n) {
      var r = Number(n % BASE);
      s = ALPHABET.charAt(r) + s;
      n = n / BASE; // BigIntの除算は切り捨て
    }
    return s;
  }
  function base62ToBigInt(s) {
    var n = 0n;
    for (var i = 0; i < s.length; i++) {
      var idx = ALPHABET.indexOf(s.charAt(i));
      if (idx < 0) return null;
      n = n * BASE + BigInt(idx);
    }
    return n;
  }

  function chunk5(str) {
    var out = [];
    for (var i = 0; i < str.length; i += CHUNK_SIZE) out.push(str.slice(i, i + CHUNK_SIZE));
    return out;
  }

  // ---------- エンコード ----------
  // entries: [{id:Number(0-65535), choiceIndex:Number(0-4)}, ...]
  // 戻り値: "xxxxx-xxxxx-..." 形式の文字列
  function encode(entries) {
    var list = (entries || []).slice().sort(function (a, b) { return a.id - b.id; });
    var payload = [VERSION_BYTE];
    list.forEach(function (e) {
      var id = e.id & 0xFFFF;
      var ci = e.choiceIndex & 0xFF;
      payload.push((id >>> 8) & 0xFF, id & 0xFF, ci);
    });
    var sum = checksum16(payload);
    var frame = payload.concat([(sum >>> 8) & 0xFF, sum & 0xFF]);
    // payload部分のみ撹拌(チェックサム2byteは平文のまま)
    for (var i = 0; i < payload.length; i++) {
      frame[i] = frame[i] ^ OBFUSCATION_KEY[i % OBFUSCATION_KEY.length];
    }
    var n = bytesToBigInt(frame);
    var b62 = bigIntToBase62(n);
    return chunk5(b62).join("-");
  }

  // ---------- デコード ----------
  // 戻り値: { ok:true, entries:[...] } | { ok:false, error:"日本語メッセージ" }
  function decode(code) {
    if (code == null) return { ok: false, error: "コードが入力されていません。" };
    if (typeof code !== "string") return { ok: false, error: "不正なコードです。" };

    var trimmed = code.trim();
    var stripped = trimmed.replace(/-/g, "");
    if (!stripped.length) return { ok: false, error: "コードが入力されていません。" };

    for (var i = 0; i < stripped.length; i++) {
      if (ALPHABET.indexOf(stripped.charAt(i)) < 0) {
        return { ok: false, error: "不正なコードです(使用できない文字が含まれています)。" };
      }
    }

    var n = base62ToBigInt(stripped);
    if (n === null) return { ok: false, error: "不正なコードです。" };

    var frame = bigIntToMinimalBytes(n);
    if (!frame || frame.length < 3 || frame.length % 3 !== 0) {
      return { ok: false, error: "コードの長さが不正です。書き間違いがあるか、コードの一部が欠けている可能性があります。" };
    }

    var payloadObf = frame.slice(0, frame.length - 2);
    var checksumBytes = frame.slice(frame.length - 2);
    var payload = payloadObf.map(function (b, idx) {
      return b ^ OBFUSCATION_KEY[idx % OBFUSCATION_KEY.length];
    });

    var expected = ((checksumBytes[0] << 8) | checksumBytes[1]) & 0xFFFF;
    var actual = checksum16(payload);
    if (actual !== expected) {
      return { ok: false, error: "コードが壊れているか改ざんされています。" };
    }

    if (payload[0] !== VERSION_BYTE) {
      return { ok: false, error: "対応していない形式のコードです(バージョン不一致)。" };
    }

    var body = payload.slice(1);
    if (body.length % 3 !== 0) {
      return { ok: false, error: "コードが壊れているか改ざんされています。" };
    }

    var entries = [];
    for (var j = 0; j < body.length; j += 3) {
      var id = (body[j] << 8) | body[j + 1];
      var ci = body[j + 2];
      if (ci < 0 || ci > 4) continue; // 破損entryは除外(全体は失敗させない)
      entries.push({ id: id, choiceIndex: ci });
    }

    return { ok: true, entries: entries };
  }

  return {
    encode: encode,
    decode: decode,
    checksum16: checksum16,
    ALPHABET: ALPHABET,
    OBFUSCATION_KEY: OBFUSCATION_KEY,
    // テスト用に内部関数も公開(ブラウザ側では通常使わない)
    _internal: {
      bytesToBigInt: bytesToBigInt,
      bigIntToMinimalBytes: bigIntToMinimalBytes,
      bigIntToBase62: bigIntToBase62,
      base62ToBigInt: base62ToBigInt
    }
  };
});

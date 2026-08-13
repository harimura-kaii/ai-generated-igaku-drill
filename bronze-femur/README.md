# 腐食青銅大腿骨 360°ビューア

医学の基礎問ドリルとは独立した、青銅大腿骨3Dモデルのブラウザビューアです。

## 公開URL

GitHub Pages:

原本・高詳細版（LOD0・約9.6MB、2Kテクスチャ）:

<https://harimura-kaii.github.io/ai-generated-igaku-drill/bronze-femur/>

共有用の原本リンク（上記と同じ高詳細版）:

<https://harimura-kaii.github.io/ai-generated-igaku-drill/bronze-femur/original/>

軽量版（LOD1・約2.9MB）:

<https://harimura-kaii.github.io/ai-generated-igaku-drill/bronze-femur/light/>

どちらもPC・スマホからアクセスできます。1本指ドラッグで回転、2本指でズーム・パンができます。

## 構成

- `index.html` — 原本・高詳細版ビューア（LOD0固定）
- `original/index.html` — 原本リンク用の入口（高詳細版へ移動）
- `light/index.html` — 軽量版ビューア（LOD1固定）
- `ancient_bronze_femur_LOD0.glb` — 高詳細版（埋め込みPNGテクスチャ付き）
- `ancient_bronze_femur_LOD1.glb` — 軽量版
- `vendor/` — Three.js、OrbitControls、GLTFLoader、RoomEnvironment（ローカル同梱）
- `utils/BufferGeometryUtils.js` — GLTFLoaderが使用するThree.js公式依存モジュール

元の青銅GLBをそのままコピーして使用しています。VRChat用データやUnity依存は含みません。

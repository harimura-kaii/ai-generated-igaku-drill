# 腐食青銅大腿骨 360°ビューア

医学の基礎問ドリルとは独立した、青銅大腿骨3Dモデルのブラウザビューアです。

## 公開URL

GitHub Pages:

<https://harimura-kaii.github.io/ai-generated-igaku-drill/bronze-femur/>

スマホではこのURLを開いてください。1本指ドラッグで回転、2本指でズーム・パンができます。

## 構成

- `index.html` — Three.js製ビューア
- `ancient_bronze_femur_LOD0.glb` — PC向け・高詳細版（埋め込みPNGテクスチャ付き）
- `ancient_bronze_femur_LOD1.glb` — スマホ向け・軽量版（自動選択）
- `vendor/` — Three.js、OrbitControls、GLTFLoader、RoomEnvironment（ローカル同梱）
- `utils/BufferGeometryUtils.js` — GLTFLoaderが使用するThree.js公式依存モジュール

元の青銅GLBをそのままコピーして使用しています。VRChat用データやUnity依存は含みません。

# 腐食青銅大腿骨 360°ビューア

医学の基礎問ドリルとは独立した、青銅大腿骨3Dモデルのブラウザビューアです。

## 公開URL

GitHub Pages:

原形状・最高精細版（元STL形状・約13.9MB、173,578三角形）:

<https://harimura-kaii.github.io/ai-generated-igaku-drill/bronze-femur/original/>

公開用LOD0版（50,336三角形）:

<https://harimura-kaii.github.io/ai-generated-igaku-drill/bronze-femur/>

軽量版（LOD1・約2.9MB）:

<https://harimura-kaii.github.io/ai-generated-igaku-drill/bronze-femur/light/>

どちらもPC・スマホからアクセスできます。1本指ドラッグで回転、2本指でズーム・パンができます。

## 構成

- `index.html` — 公開用LOD0ビューア（50,336三角形）
- `original/index.html` — 原形状リンク用の入口
- `original-shape/index.html` — 元STL形状ビューア（173,578三角形）
- `original-shape/ancient_bronze_femur_source.glb` — 元形状を保持したWeb用GLB
- `light/index.html` — 軽量版ビューア（LOD1固定）
- `ancient_bronze_femur_LOD0.glb` — 高詳細版（埋め込みPNGテクスチャ付き）
- `ancient_bronze_femur_LOD1.glb` — 軽量版
- `vendor/` — Three.js、OrbitControls、GLTFLoader、RoomEnvironment（ローカル同梱）
- `utils/BufferGeometryUtils.js` — GLTFLoaderが使用するThree.js公式依存モジュール

原形状版は元のオープンソースSTLのトポロジーを保持し、ブラウザ表示用にUVと2K腐食テクスチャだけを付加しています。VRChat用データやUnity依存は含みません。

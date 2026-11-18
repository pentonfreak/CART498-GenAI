# NOCTIS — complete assignment walkthrough

## 0 — What is finished, and what still needs real model runs?

The static website already works: previous/next arrows, keyboard navigation, a 50-picture filmstrip, 16 species, 16 language phrases, and playable audio. The bundled visual and audio assets are **procedural DEMOS**, not outputs from diffusion models. Two Colab notebooks are provided, but their online training and inference cells have **not** been executed as part of this package.

The intended final deliverables are **50 actual LoRA-generated images**, **16 actual AudioLDM-generated sounds**, the existing 16 fictional phrases, a public GitHub repository, and your live GitHub Pages URL.

## 1 — Test the webpage before training

Unzip the project. Double-click `index.html` or open the whole folder in VS Code and use **Live Server**. Browse sightings, click **Play**, and try the arrow keys. The site uses relative paths, so the exact same files work on GitHub Pages.

Optional: Run `python -m http.server 8000` from this folder, then open `http://localhost:8000/`.

## 2 — Train/generate images in Google Colab

1. Open [Google Colab](https://colab.research.google.com/).
2. Choose **File → Upload notebook** and upload `image-generation.ipynb`.
3. Choose **Runtime → Change runtime type → T4 GPU**.
4. Run the cells in order. Use `DATASET_SIZE=160`, `RESOLUTION=384`, and `MAX_TRAIN_STEPS=500` to start; if your GPU runs out of memory, reduce resolution to 256. If the base model asks for permission, visit the listed model page, accept its terms and sign in to Hugging Face.
5. Review the visual contact sheet and save a screenshot of your training logs and example outputs. For experimentation, compare dataset sizes (80 versus 160), resolutions (256 versus 384), or steps (250 versus 500). You need not run all combinations, but document meaningful changes.
6. In the last notebook cell, make a ZIP of the 50 images. Choose a **download** route or the **Google Drive** route if normal downloads fail.
7. Extract `images-generated.zip` and copy the 50 JPEGs into this project's `images/` folder, overwriting the same names. Do not copy the original real-animal source images to GitHub.

## 3 — Generate sounds in Google Colab

1. Upload `sound-generation.ipynb` in Colab and select a GPU.
2. Run the cells. This notebook does **not train** AudioLDM — it loads a pre-trained text-to-audio diffusion model, as required.
3. It generates `call-01.wav` through `call-16.wav`, each with a different prompt and duration.
4. Listen to a few files. Improve prompts and regenerate weak sounds if necessary.
5. Export `sounds-generated.zip` using the browser or Google Drive. Extract it and overwrite the 16 WAVs in `sounds/`.

## 4 — Add your language and credit your assistance

The site already contains sixteen fictional phrases with English translations. Edit `data/species.js` if you want to modify them. Explain the consistent sound-symbol system in the README and credit the AI assistance that was actually used. If you used a different AI account or model, correct the disclosure; do not represent unused software as used.

## 5 — Change the site from DEMO to FINAL

Open `script.js`. Change:

```js
const DEMO_MODE = true;
```

to:

```js
const DEMO_MODE = false;
```

Only make this change after **all 50 JPEGs and 16 WAVs have been replaced** with authentic model outputs. Remove or update the two `DEMO_ASSETS.txt` notes if you want, once the files have been replaced. Update README with the *actual* experiment configuration and what you observed.

## 6 — Create your GitHub repository (the exact name matters)

1. Go to [github.com/new](https://github.com/new) and create a **public** repository named **`postcards-from-my-jungle`**.
2. Upload the entire *contents* of the project folder (not a nested folder). `index.html` needs to be in the root of the repository. With GitHub Desktop or Git command-line this is easiest.
3. For Git on your machine, in the unzipped project folder:

```bash
git init
git add .
git commit -m "Create Noctis jungle archive with Colab notebooks"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/postcards-from-my-jungle.git
git push -u origin main
```

Replace `YOUR-USERNAME` with your GitHub username. If you initialized the GitHub repository with an existing README, clone it first, then copy project contents in, commit and push to avoid conflicts.

## 7 — Publish with GitHub Pages

1. Open the GitHub repository and go to **Settings → Pages**.
2. Under **Build and deployment**, choose **Deploy from a branch**.
3. Set branch **main**, folder **/(root)**, and click **Save**.
4. Your site will have a URL of the form `https://YOUR-USERNAME.github.io/postcards-from-my-jungle/`. It may take several minutes to appear. Refresh if necessary.
5. Open the site and check that a photograph, a sound, and the phrase all work. Because the repo is public, no API keys or secrets should be committed.

## 8 — Submit these two links

- **GitHub Pages website:** `https://YOUR-USERNAME.github.io/postcards-from-my-jungle/`
- **Public repository:** `https://github.com/YOUR-USERNAME/postcards-from-my-jungle`

Replace the username and verify the pages exist before submitting. The ZIP itself is **not** a hosted link.

## Troubleshooting

- **Colab has no GPU:** Use Runtime → Change runtime type and select T4 or another NVIDIA GPU. Free GPU sessions are not guaranteed.
- **Colab stops during training:** Reduce image resolution / dataset size / training steps. Consider copying checkpoints to Drive if session stability is a problem.
- **Can't download from Colab:** Uncomment and run the `drive.mount(...)` and `copy2(...)` lines in the export cell. Open Google Drive directly and download the ZIP there.
- **Site images are broken:** Ensure the names are exactly `images/image-001.jpg` to `images/image-050.jpg`, with lowercase extension. All links are relative to `index.html`.
- **Audio doesn't play:** Check `sounds/call-01.wav` to `sounds/call-16.wav`. Playback starts only after a user clicks Play.
- **GitHub Pages is blank:** Verify `index.html` is at the repository root and Pages uses main / (root).
- **Model access errors:** Check the model card's license/access requirements and sign in if prompted. Do not paste private tokens into a public notebook or GitHub commit.

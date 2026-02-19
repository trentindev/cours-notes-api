import express from "express";
import fs from "fs";
import { marked } from "marked";
import path from "path";
import { fileURLToPath } from "url";

// Reconstitution de __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Création de l'application Express (serveur HTTP)
const app = express();

// Port d'écoute du serveur
const PORT = 3000;

// Chemin absolu vers le dossier contenant les fichiers Markdown
const NOTES_DIR = path.join(__dirname, "notes");

// Route racine
// Permet de vérifier que l'API fonctionne
app.get("/", (req, res) => {
  res.send("API des notes de cours");
});

// Route qui retourne la liste des notes disponibles
// Elle lit le contenu du dossier "notes"
app.get("/notes", (req, res) => {
  // Vérification de l'existence du dossier
  if (!fs.existsSync(NOTES_DIR)) {
    return res.status(500).send("Dossier notes introuvable");
  }

  // Lecture des fichiers présents dans le dossier
  const files = fs.readdirSync(NOTES_DIR);

  // On filtre uniquement les fichiers .md
  // Puis on retire l'extension pour créer un "slug"
  const notes = files
    .filter((file) => file.endsWith(".md"))
    .map((file) => file.replace(".md", ""));

  // On renvoie la liste au format JSON
  res.json(notes);
});

// Route dynamique
// :slug représente un paramètre variable dans l'URL
// Exemple : /notes/git-introduction
app.get("/notes/:slug", (req, res) => {
  // Récupération du paramètre dans l'URL
  const slug = req.params.slug;

  // Construction du chemin du fichier correspondant
  const filePath = path.join(NOTES_DIR, slug + ".md");

  // Si le fichier n'existe pas → erreur 404
  if (!fs.existsSync(filePath)) {
    return res.status(404).send("Note non trouvée");
  }

  // Lecture du contenu Markdown
  const markdownContent = fs.readFileSync(filePath, "utf-8");

  // Transformation Markdown → HTML
  const htmlContent = marked(markdownContent);

  // Envoi du HTML au navigateur
  res.send(htmlContent);
});

// Démarrage du serveur HTTP
// Le serveur écoute les requêtes sur le port défini
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});

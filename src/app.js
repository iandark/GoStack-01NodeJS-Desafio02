const express = require("express");
const cors = require("cors");

const { v4: uuidv4, validate: uuidValidate } = require("uuid");

const app = express();

function validateRepositoryId(request, response, next) {
    const { id } = request.params;
    const repositoryIndex = repositories.findIndex(
        (repository) => repository.id === id
    );

    if (repositoryIndex < 0) {
        return response.status(403).json({ error: "Repository not found." });
    }

    request.repositoryIndex = repositoryIndex;
    return next();
}

function validateUuid(request, response, next) {
    const { id } = request.params;
    if (!uuidValidate(id)) {
        return response.status(400).json({ erro: "Invalid repository id." });
    }

    return next();
}

app.use(express.json());
app.use(cors());

app.use("/repositories/:id", validateUuid, validateRepositoryId);

const repositories = [];
const likes = [];

app.get("/repositories", (request, response) => {
    return response.json(repositories);
});

app.post("/repositories", (request, response) => {
    const { title, url, techs } = request.body;
    const id = uuidv4();
    likes.push({
        id,
        dateAdded: [],
    });
    const repository = {
        id,
        title,
        url,
        techs,
        likes: 0,
    };
    repositories.push(repository);

    response.json(repository);
});

app.put("/repositories/:id", (request, response) => {
    const { repositoryIndex } = request;
    const { id } = request.params;
    const { title, url, techs } = request.body;

    const repository = {
        id,
        title,
        url,
        techs,
        likes: repositories[repositoryIndex].likes,
    };

    repositories[repositoryIndex] = repository;

    return response.json(repository);
});

app.delete("/repositories/:id", (request, response) => {
    const { repositoryIndex } = request;
    repositories.splice(repositoryIndex, 1);

    return response.status(204).send();
});

app.post("/repositories/:id/like", (request, response) => {
    const { repositoryIndex } = request;
    const { id } = request.params;

    const likeRespositoryIndex = likes.findIndex(
        (repository) => repository.id === id
    );

    if (likeRespositoryIndex < 0) {
        return response
            .status(400)
            .json({ error: "Repository to add like not found" });
    }

    likes[likeRespositoryIndex].dateAdded.push(new Date());
    repositories[repositoryIndex].likes += 1;

    return response.json(repositories[repositoryIndex]);
});

app.put("/repositories/:id/like", (request, response) => {
    const { repositoryIndex } = request;
    const { id } = request.params;

    const likeRespositoryIndex = likes.findIndex(
        (repository) => repository.id === id
    );

    if (likeRespositoryIndex < 0) {
        return response
            .status(400)
            .json({ error: "Repository to add like not found" });
    }

    likes[likeRespositoryIndex].dateAdded.push(new Date());

    repositories[repositoryIndex].likes =
        likes[
            likes.findIndex((likeRepository) => likeRepository.id === id)
        ].dateAdded.length;

    return response.json(repositories[repositoryIndex]);
});

module.exports = app;

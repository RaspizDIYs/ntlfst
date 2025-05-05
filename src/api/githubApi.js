import { Octokit } from "@octokit/core";

const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN // опционально, если нужен токен
});

export const getOrgMembers = async (org) => {
    try {
        const response = await octokit.request('GET /orgs/{org}/members', {
            org: org,
            headers: {
                'X-GitHub-Api-Version': '2022-11-28'
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching members:", error);
        return [];
    }
};

export const getUserRepos = async (username) => {
    try {
        const response = await octokit.request('GET /users/{username}/repos', {
            username: username,
            headers: {
                'X-GitHub-Api-Version': '2022-11-28'
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching repos:", error);
        return [];
    }
};

export const getRepoLanguages = async (owner, repo) => {
    try {
        const response = await octokit.request('GET /repos/{owner}/{repo}/languages', {
            owner: owner,
            repo: repo,
            headers: {
                'X-GitHub-Api-Version': '2022-11-28'
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching languages:", error);
        return {};
    }
};
import readConfig from "./read_config";
import { GraphQLClient, request, gql } from "graphql-request";
import fs from "fs";
import jwtDecode, { JwtPayload } from "jwt-decode";

const endpoint = "https://api.render.com/graphql";

function retrieveLocalToken(): string {
  const rawdata = fs.readFileSync("session_store.json").toString();
  if (rawdata == "") return "";
  try {
    return JSON.parse(rawdata).authToken;
  } catch (e) {
    if (e instanceof SyntaxError) return "";
    throw e;
  }
}

function writeLocalToken(token: string): void {
  fs.writeFileSync("session_store.json", JSON.stringify({ authToken: token }));
}

async function fetchNewAuthToken(): Promise<string> {
  const query = gql`
    mutation signIn($email: String!, $password: String!) {
      signIn(email: $email, password: $password) {
        idToken
      }
    }
  `;
  const { email, password } = readConfig();
  const variables = { email, password };

  try {
    const response = await request(endpoint, query, variables);
    return response.signIn.idToken;
  } catch (error) {
    throw error;
  }
}

async function updateToken(): Promise<string> {
  const newToken = await fetchNewAuthToken();
  writeLocalToken(newToken);
  return newToken;
}

async function getAuthToken(): Promise<string> {
  const localToken = retrieveLocalToken();
  if (!localToken) {
    return updateToken();
  }
  const expireDateTime = jwtDecode<JwtPayload>(localToken).exp;
  if (expireDateTime <= Date.now() - 60 * 60) {
    return localToken;
  } else {
    return updateToken();
  }
}

async function getGraphQLClient(): Promise<GraphQLClient> {
  const authToken = await getAuthToken();

  return new GraphQLClient(endpoint, {
    headers: {
      authorization: `Bearer ${authToken}`,
    },
  });
}

export default getGraphQLClient;

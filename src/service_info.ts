import { gql } from "graphql-request";
import getGraphQLClient from "./graphql_client";
import readConfig from "./read_config";

type ServiceInfo = {
  id: string;
  // cpuCount: number;
  memory: number;
  instanceCount: number;
  memoryTicks: { memory: number; time: number }[];
};

const { ownerId } = readConfig();

async function getIds(): Promise<{ id: string; name: string }[]> {
  const client = await getGraphQLClient();

  const query = gql`
    query servicesForOwner($ownerId: String!) {
      servicesForOwner(ownerId: $ownerId) {
        id
        name
      }
    }
  `;
  try {
    const data = await client.request(query, { ownerId });
    return data.servicesForOwner;
  } catch (error) {
    throw error;
  }
}

async function getMemory(serviceId: string): Promise<number> {
  const client = await getGraphQLClient();
  const planToMemoryMap: { [key: string]: number } = {
    Starter: 512,
    "Starter Plus": 1024,
    Standard: 2048,
    "Standard Plus": 3060,
    Pro: 4096,
    "Pro Plus": 8192,
  };
  const query = gql`
    query server($id: String!) {
      server(id: $id) {
        ...serverFields
      }
    }

    fragment serverFields on Server {
      plan {
        name
      }
    }
  `;
  try {
    const data = await client.request(query, { id: serviceId });
    return planToMemoryMap[data.server.plan.name];
  } catch (error) {
    throw error;
  }
}

async function getInstanceCount(serviceId: string): Promise<number> {
  const client = await getGraphQLClient();
  const query = gql`
    query server($id: String!) {
      server(id: $id) {
        id
        extraInstances
      }
    }
  `;
  try {
    const data = await client.request(query, { id: serviceId });
    return data.extraInstances;
  } catch (error) {
    throw error;
  }
}

async function updateInstanceCount(
  serviceId: string,
  count: number,
): Promise<void> {
  const client = await getGraphQLClient();
  const query = gql`
    mutation updateServerInstanceCount($id: String!, $count: Int!) {
      updateServerInstanceCount(id: $id, count: $count) {
        id
        extraInstances
      }
    }
  `;
  try {
    await client.request(query, { id: serviceId, count });
  } catch (error) {
    throw error;
  }
}

async function getMetrics(
  serviceId: string,
): Promise<{ time: string; memory: number }[]> {
  const client = await getGraphQLClient();
  const query = gql`
    query serviceMetrics(
      $serviceId: String!
      $historyMinutes: Int!
      $step: Int!
    ) {
      service(id: $serviceId) {
        metrics(historyMinutes: $historyMinutes, step: $step) {
          samples {
            time
            memory
          }
        }
      }
    }
  `;
  try {
    const data = await client.request(query, {
      serviceId,
      historyMinutes: 5,
      step: 1,
    });
    return data.service.metrics.samples;
  } catch (error) {
    throw error;
  }
}

async function getServicesInfo(serviceNames: string[]): Promise<ServiceInfo[]> {
  const serviceIds = getIds();

  // serviceNames.map((serviceName: string) => {

  // });

  return [];
}

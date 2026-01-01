import { graphqlRequest } from "@/lib/graphql";
import { Property, PropertyFilters, PaginatedResponse } from "@/types/property";

const PROPERTY_FIELDS = `
  id
  title
  slug
  description
  propertyType
  listingType
  status
  price
  bedrooms
  bathrooms
  area
  address
  district
  province
  thumbnailUrl
  images {
    url
    order
  }
  owner {
    id
    name
    image
  }
`;

export const propertyGraphqlService = {
  getById: async (id: string): Promise<Property> => {
    const query = `
      query GetProperty($id: ID!) {
        property(id: $id) {
          ${PROPERTY_FIELDS}
        }
      }
    `;
    const data = await graphqlRequest(query, { id });
    return {
      ...data.property,
      images: data.property.images.map((img: any) => img.url),
    };
  },

  getBySlug: async (slug: string): Promise<Property> => {
    const query = `
      query GetPropertyBySlug($slug: String!) {
        propertyBySlug(slug: $slug) {
          ${PROPERTY_FIELDS}
        }
      }
    `;
    const data = await graphqlRequest(query, { slug });
    return {
      ...data.propertyBySlug,
      images: data.propertyBySlug.images.map((img: any) => img.url),
    };
  },

  getAll: async (
    params?: PropertyFilters
  ): Promise<PaginatedResponse<Property>> => {
    const query = `
      query GetProperties($first: Int, $after: String, $filter: PropertyFilter) {
        properties(first: $first, after: $after, filter: $filter) {
          edges {
            node {
              ${PROPERTY_FIELDS}
            }
            cursor
          }
          pageInfo {
            hasNextPage
            endCursor
          }
          totalCount
        }
      }
    `;

    const variables = {
      first: params?.limit || 10,
      after: undefined,
      filter: {
        propertyType: params?.propertyType,
        listingType: params?.listingType,
        minPrice: params?.priceMin,
        maxPrice: params?.priceMax,
      },
    };

    const data = await graphqlRequest(query, variables);

    return {
      data: data.properties.edges.map((edge: any) => ({
        ...edge.node,
        images: edge.node.images.map((img: any) => img.url),
      })),
      total: data.properties.totalCount,
      page: params?.page || 1,
      limit: params?.limit || 10,
      offset: ((params?.page || 1) - 1) * (params?.limit || 10),
    };
  },
};

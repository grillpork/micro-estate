export const typeDefs = /* GraphQL */ `
  scalar DateTime

  # ===== User Types =====
  type User {
    id: ID!
    email: String!
    name: String
    image: String
    role: String!
    phone: String
    bio: String
    isOnline: Boolean!
    createdAt: DateTime!
  }

  # ===== Property Types =====
  type Property {
    id: ID!
    title: String!
    slug: String!
    description: String
    propertyType: PropertyType!
    listingType: ListingType!
    status: PropertyStatus!
    price: Float!
    pricePerSqm: Float
    bedrooms: Int
    bathrooms: Int
    area: Float
    landArea: Float
    floors: Int
    yearBuilt: Int
    address: String
    district: String
    province: String
    postalCode: String
    latitude: Float
    longitude: Float
    features: [String!]
    amenities: [String!]
    thumbnailUrl: String
    images: [PropertyImage!]!
    views: Int!
    favorites: Int!
    isFeatured: Boolean!
    isFavorited: Boolean!
    owner: User!
    publishedAt: DateTime
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type PropertyImage {
    id: ID!
    url: String!
    alt: String
    order: Int!
  }

  enum PropertyType {
    house
    condo
    townhouse
    land
    commercial
    apartment
  }

  enum ListingType {
    sale
    rent
  }

  enum PropertyStatus {
    draft
    active
    pending
    sold
    rented
    inactive
  }

  # ===== Message Types =====
  type Message {
    id: ID!
    content: String
    imageUrls: [String!]
    isRead: Boolean!
    sender: User!
    receiver: User!
    createdAt: DateTime!
  }

  type Conversation {
    partnerId: ID!
    partnerName: String
    partnerImage: String
    lastMessage: String
    lastMessageAt: DateTime!
    unreadCount: Int!
    isOnline: Boolean!
  }

  # ===== Notification Types =====
  type Notification {
    id: ID!
    type: String!
    title: String!
    body: String
    data: String
    isRead: Boolean!
    createdAt: DateTime!
  }

  # ===== Pagination Types =====
  type PropertyConnection {
    edges: [PropertyEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type PropertyEdge {
    node: Property!
    cursor: String!
  }

  type PageInfo {
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    startCursor: String
    endCursor: String
  }

  # ===== Input Types =====
  input PropertyFilter {
    propertyType: PropertyType
    listingType: ListingType
    status: PropertyStatus
    minPrice: Float
    maxPrice: Float
    bedrooms: Int
    bathrooms: Int
    province: String
    q: String
  }

  input PropertySort {
    field: PropertySortField!
    order: SortOrder!
  }

  enum PropertySortField {
    createdAt
    price
    views
    favorites
  }

  enum SortOrder {
    asc
    desc
  }

  # ===== Queries =====
  type Query {
    # Users
    me: User
    user(id: ID!): User
    users(limit: Int, offset: Int): [User!]!

    # Properties
    property(id: ID!): Property
    propertyBySlug(slug: String!): Property
    properties(
      first: Int
      after: String
      filter: PropertyFilter
      sort: PropertySort
    ): PropertyConnection!
    myProperties: [Property!]!
    featuredProperties(limit: Int): [Property!]!

    # Search
    searchProperties(q: String!, limit: Int): [Property!]!
    searchSuggestions(q: String!): [String!]!

    # Chat
    conversations: [Conversation!]!
    messages(partnerId: ID!, first: Int, after: String): [Message!]!
    unreadMessageCount: Int!

    # Notifications
    notifications(first: Int, after: String): [Notification!]!
    unreadNotificationCount: Int!

    # Favorites
    myFavorites: [Property!]!
    isFavorited(propertyId: ID!): Boolean!

    # Online Status
    usersOnlineStatus(userIds: [ID!]!): [UserOnlineStatus!]!
  }

  type UserOnlineStatus {
    userId: ID!
    isOnline: Boolean!
    lastSeen: DateTime
  }

  # ===== Mutations =====
  type Mutation {
    # Messages
    sendMessage(
      receiverId: ID!
      content: String
      imageUrls: [String!]
    ): Message!
    markMessagesAsRead(messageIds: [ID!]!): Boolean!

    # Notifications
    markNotificationsAsRead(notificationIds: [ID!]!): Boolean!
    markAllNotificationsAsRead: Boolean!

    # Favorites
    addFavorite(propertyId: ID!): Boolean!
    removeFavorite(propertyId: ID!): Boolean!
    toggleFavorite(propertyId: ID!): Boolean!
  }

  # ===== Subscriptions =====
  type Subscription {
    messageReceived: Message!
    notificationReceived: Notification!
    userStatusChanged: UserOnlineStatus!
    typingIndicator(partnerId: ID!): TypingIndicator!
  }

  type TypingIndicator {
    userId: ID!
    userName: String!
    isTyping: Boolean!
  }
`;

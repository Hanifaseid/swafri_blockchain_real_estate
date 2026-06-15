export const queryKeys = {
  auth: {
    me: ["auth", "me"],
  },

  users: {
    all: ["users"],
    detail: (id: string) => ["users", id],
  },

  listings: {
    all: ["listings"],
    detail: (id: string) => ["listings", id],
  },
};
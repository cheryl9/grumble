import api from "./api";

const cache = new Map();
const inflight = new Map();

export async function getFriendsVisitedByRestaurantId(restaurantId) {
  const id = Number(restaurantId);
  if (!Number.isInteger(id)) return [];

  if (cache.has(id)) {
    return cache.get(id);
  }

  if (inflight.has(id)) {
    return inflight.get(id);
  }

  const request = api
    .get(`/food-places/${id}/friends-visited`)
    .then((response) => response.data?.friendsVisited || [])
    .then((friends) => {
      cache.set(id, friends);
      inflight.delete(id);
      return friends;
    })
    .catch((error) => {
      inflight.delete(id);
      throw error;
    });

  inflight.set(id, request);
  return request;
}

import api from "./api";

const cache = new Map();
const inflight = new Map();

export async function getFoodPlaceById(foodPlaceId) {
  const id = Number(foodPlaceId);
  if (!Number.isInteger(id)) return null;

  if (cache.has(id)) {
    return cache.get(id);
  }

  if (inflight.has(id)) {
    return inflight.get(id);
  }

  const request = api
    .get(`/food-places/${id}`)
    .then((response) => response.data)
    .then((place) => {
      cache.set(id, place);
      inflight.delete(id);
      return place;
    })
    .catch((error) => {
      inflight.delete(id);
      throw error;
    });

  inflight.set(id, request);
  return request;
}

import axios from "axios";
import { User } from "../types";

const lichessApi = axios.create({
  baseURL: "https://lichess.org/api/",
  timeout: 10000,
});

export const getUserStatus = async (
  ids: string[] | string
): Promise<Partial<User>[]> => {
  if (!ids) {
    return Promise.reject("invalid id");
  }

  try {
    const response = await lichessApi.get<Partial<User>[]>("/users/status", {
      params: {
        ids: Array.isArray(ids) ? ids.join(",") : ids,
      },
    });

    if (response.status == 200) {
      //console.log(response);

      return response.data.map<Partial<User>>((status) => {
        return {
          id: status.id,
          online: status.online || false,
          playing: status.playing || false,
        };
      });
    } else {
      return Promise.reject(`unexpected status code: ${response.status}`);
    }
  } catch (err) {
    return Promise.reject(err);
  }
};

export const getUserData = async (id: string): Promise<Partial<User>> => {
  if (!id) {
    return Promise.reject("invalid id");
  }

  try {
    const response = await lichessApi.get<User>(`/user/${id}`);

    if (response.status == 200) {
      console.log("getUserDataResponse:");
      console.log(response);

      return {
        id: id,
        username: response.data.username || id,
        title: response.data.title || "",
        online: response.data.online || false,
        playing: response.data.playing ? true : false || false,
        patron: response.data.patron || false,
        perfs: response.data.perfs || {},
        seenAt: response.data.seenAt || 0,
        lastApiUpdate: Date.now(),
      };
    } else {
      return Promise.reject(`unexpected status code: ${response.status}`);
    }
  } catch (err) {
    return Promise.reject(err);
  }
};

export const getUserGame = async (id: string): Promise<void> => {
  if (id) {
    const response = await lichessApi.get<User>(`/user/${id}`);

    if (response.status == 200) {
      console.log(response.data.playing);
    }
  }
};

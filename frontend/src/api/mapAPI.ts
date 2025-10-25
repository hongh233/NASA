import axios from "axios";

const mapApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE,
});

export default mapApi;
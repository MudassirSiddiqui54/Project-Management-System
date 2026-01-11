//axios is used to make api requests to backend in a simple and sane way to avoid using fetch in a complicated way
// const res = await fetch("http://localhost:5000/api/v1/auth/login", {
//   method: "POST",
//   headers: { "Content-Type": "application/json" },
//   credentials: "include",
//   body: JSON.stringify(data)
// });
// if (!res.ok) {
//   const err = await res.json();
//   throw err;
// }
// const result = await res.json();      <---- like this___|^|
import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8000/api/v1",
    withCredentials: true, //“If my backend uses cookies (refresh tokens), include them.”
    headers: {
        "Content-type": "application/json"
    }
});

export default api;
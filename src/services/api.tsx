import axios from 'axios';

const api = axios.create({
    baseURL: 'https://nlw-ecoleta-server.herokuapp.com'
})

export default api
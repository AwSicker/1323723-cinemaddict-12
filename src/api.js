import FilmsModel from "./model/films.js";
import CommentsModel from "./model/comment.js";
const Method = {
  GET: `GET`,
  PUT: `PUT`,
  POST: `POST`,

};

const SuccessHTTPStatusRange = {
  MIN: 200,
  MAX: 299
};

export default class Api {
  constructor(endPoint, authorization) {
    this._endPoint = endPoint;
    this._authorization = authorization;
  }

  getFilms() {
    return this._load({url: `movies`})
    .then(Api.toJSON)
    .then((films) => films.map((film) => FilmsModel.adaptToClient(film)));
  }

  getComments(id) {
    return this._load({url: `/comments/${id}`})
    .then(Api.toJSON);
  }


  updateFilm(film) {
    return this._load({
      url: `movies/${film.id}`,
      method: Method.PUT,
      body: JSON.stringify(FilmsModel.adaptToServer(film)),
      headers: new Headers({"Content-Type": `application/json`})
    })
      .then(Api.toJSON)
      .then(FilmsModel.adaptToClient);
  }

  addComment(comment) {
    return this._load({
      url: `comments/${comment}`,
      method: Method.POST,
      body: JSON.stringify(CommentsModel.adaptToServer(comment)),
      headers: new Headers({"Content-Type": `application/json`})
    })
    .then(Api.toJSON)
      .then((response) => {
        response.comments = response.comments.map(CommentsModel.adaptToClient);
        return response;
      });
  }

  _load({
    url,
    method = Method.GET,
    body = null,
    headers = new Headers()
  }) {
    headers.append(`Authorization`, this._authorization);
    return fetch(`${this._endPoint}/${url}`,
        {method, body, headers})
        .then(Api.checkStatus)
        .catch(Api.catchError);
  }

  static checkStatus(response) {
    if (
      response.status < SuccessHTTPStatusRange.MIN &&
response.status > SuccessHTTPStatusRange.MAX
    ) {
      throw new Error(`${response.status}: ${response.statusText}`);
    }
    return response;
  }

  static toJSON(response) {
    return response.json();
  }

  static catchError(err) {
    throw err;
  }
}
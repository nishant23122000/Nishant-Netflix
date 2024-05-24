import "./movie-card.css";

// TMDB does not provide cast, director in this API  : https://api.themoviedb.org/3/discover/movie
function MovieCard({ title, overview, poster, id, genre_ids, genreMap }) {
  console.log(genre_ids, "nik", genreMap);
  return (
    <div
      id={id}
      style={{
        backgroundImage: `url(https://image.tmdb.org/t/p/w154/${poster})`,
      }}
      className="movie-card"
    >
      <div className="movie-card-inner">
        <p className="title">{title}</p>
        <div className="overview-section">
          <p className="overview">{overview}</p>
        </div>
        <div className="genres-section">
          <span className="genres">Categories : </span>
          {genre_ids &&
            genre_ids.map((id) => {
              return <span className="genres">{genreMap.get(id)},</span>;
            })}
        </div>
      </div>
      <div className="backdrop"></div>
    </div>
  );
}

export default MovieCard;

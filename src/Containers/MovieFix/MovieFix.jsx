import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import MovieCard from "../../Components/MovieCard";
import "./movie-fix.css";
import LoadingIndicator from "../../Components/LoadingIndicator";

const API_KEY = "2dca580c2a14b55200e784d157207b4d";

const options = {
  root: document.getElementsByClassName("moviefix-section")[0],
  rootMargin: "300px 0px 0px 0px",
  threshold: 1,
};

const downOptions = {
  root: document.getElementsByClassName("moviefix-section")[0],
  rootMargin: "0px 0px 800px 0px",
  threshold: 1,
};

function MovieFix() {
  const [movies, setMovies] = useState(new Map());
  const [prevLoadedyear, setPrevLoadedYear] = useState(2012);
  const [nextLoadedyear, setNextLoadedYear] = useState(2012);
  const [selectedGenres, setSelectedgenres] = useState("");
  const [genres, setGenres] = useState([]);
  const [isLoadingPrevious, setLoadingPrevious] = useState(false);
  const [isLoadingNext, setLoadingNext] = useState(false);
  const [genreMap, setGenreMap] = useState(new Map());

  const fetchMovies = async ({
    sort_by,
    release_year,
    page,
    vote_count,
    genres,
    prev,
  }) => {
    try {
      if (prev) setLoadingPrevious(true);
      else setLoadingNext(true);

      const res = await fetch(
        `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&sort_by=${sort_by}&primary_release_year=${release_year}&page=${page}&vote_count.gte=${vote_count}&with_genres=${genres}`
      );
      const resMovies = await res.json();

      setMovies((prevMovies) => {
        const newMap = new Map(prevMovies);

        if (prev) {
          const mapForPrev = new Map();
          if (!prevMovies.get(release_year))
            mapForPrev.set(release_year, resMovies.results);
          prevMovies.forEach((value, key) => {
            mapForPrev.set(key, value);
          });

          return mapForPrev;
        } else {
          if (!newMap.get(release_year))
            newMap.set(release_year, resMovies.results);

          return newMap;
        }
      });
      if (prev) setLoadingPrevious(false);
      else setLoadingNext(false);
    } catch (error) {}
  };

  const fetchGenre = async () => {
    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/genre/movie/list?api_key=${API_KEY}`
      );
      const resGenre = await res.json();

      setGenres(resGenre.genres);
      const genreMap = new Map();
      resGenre.genres.forEach((genre) => {
        genreMap.set(genre.id, genre.name);
      });
      setGenreMap(genreMap);
      // setMovies((prevMovies) => {
      //   const newMap = new Map(prevMovies);
      //   if (!newMap.get(release_year)) {
      //     newMap.set(release_year, resMovies.results);
      //   }
      //   return newMap;
      // });
    } catch (error) {
      window.alert("API error, please use VPN");
    }
  };

  // Intial 2012 movies as describe in assignment
  useEffect(() => {
    fetchMovies({
      sort_by: "popularity.desc",
      release_year: 2012,
      page: 1,
      vote_count: 100,
      genres: [],
    });

    setTimeout(() => {
      let target = document.querySelector("#load-previous");

      target.scrollIntoView();
    }, 1000);

    fetchGenre();
  }, []);

  // Using IntersectionObserver to load scroll up(previous year) movies
  useLayoutEffect(() => {
    let target;
    let observer;

    target = document.querySelector("#load-previous");

    observer = new IntersectionObserver(([entry]) => {
      // This to check position to scroll
      if (entry && entry.boundingClientRect.top < 0) {
        if (entry.isIntersecting) {
          fetchMovies({
            sort_by: "popularity.desc",
            release_year: prevLoadedyear - 1,
            page: 1,
            vote_count: 100,
            genres: selectedGenres,

            prev: true,
          });

          // To Trace the previous loaded year
          setPrevLoadedYear(prevLoadedyear - 1);
        }
      }
    }, options);

    if (target) setTimeout(() => observer.observe(target), 1000);

    return () => {
      if (target) observer.unobserve(target);
    };
  }, [movies.size, selectedGenres]);

  // Using IntersectionObserver to load scroll down(next year) movies
  useLayoutEffect(() => {
    let target;
    let observer;

    target = document.querySelector("#load-next");

    observer = new IntersectionObserver(([entry]) => {
      if (entry) {
        if (entry.isIntersecting) {
          fetchMovies({
            sort_by: "popularity.desc",
            release_year: nextLoadedyear + 1,
            page: 1,
            vote_count: 100,
            genres: selectedGenres,
          });

          // To trace the next year that need to load
          setNextLoadedYear(nextLoadedyear + 1);
        }
      }
    }, downOptions);

    if (target) setTimeout(() => observer.observe(target), 1000);

    return () => {
      if (target) observer.unobserve(target);
    };
  }, [movies.size, selectedGenres]);

  const toggleGenre = (genreId) => {
    const genreIndex = genres.findIndex((genre) => genre.id === genreId);
    const genre = genres[genreIndex];

    if (genre.selected) genre.selected = false;
    else genre.selected = true;

    // Replace new one with old one
    genres[genreIndex] = genre;

    const newGenres = [...genres];

    const selectedGeneres = newGenres
      .filter((genre) => genre.selected == true)
      .map((genre) => genre.id);

    setSelectedgenres(selectedGeneres.toString());

    // Clear the old state as genre filter changed
    setMovies(new Map());

    fetchMovies({
      sort_by: "popularity.desc",
      release_year: 2012,
      page: 1,
      vote_count: 100,
      genres: selectedGeneres.toString(),
    });
    setGenres(newGenres);
  };

  return (
    <>
      <div className="genres-section">
        {genres.map((genre) => {
          return (
            <div
              style={{
                backgroundColor: genre.selected ? "red" : "rgb(0, 37, 63)",
                border: genre.selected
                  ? "1px solid red"
                  : "1px solid rgb(0, 37, 63)",
              }}
              onClick={() => toggleGenre(genre.id)}
              role="button"
              className="genre"
              key={genre.id}
            >
              <p>{genre.name}</p>
            </div>
          );
        })}
      </div>
      {isLoadingPrevious && <LoadingIndicator />}
      {Array.from(movies).length &&
        Array.from(movies).map(
          ([key, movieList], index, { length: yearsLength }) => {
            return (
              <div key={key} className="moviefix-section">
                <p className="year" id={index == 0 ? "load-previous" : null}>
                  {key}
                </p>

                <div className="movies-section">
                  {movieList.map((movie, innerIndex, { length }) => {
                    return (
                      <MovieCard
                        id={
                          index == yearsLength - 1 && length == innerIndex + 1
                            ? "load-next"
                            : null
                        }
                        key={movie.id}
                        title={movie.title}
                        overview={movie.overview}
                        poster={movie.poster_path}
                        genre_ids={movie.genre_ids}
                        genreMap={genreMap}
                      />
                    );
                  })}
                </div>
                <div className="hr" />
              </div>
            );
          }
        )}

      {/* Loading Indicator */}
      {isLoadingNext && <LoadingIndicator />}
    </>
  );
}

export default MovieFix;

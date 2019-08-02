import { parse, stringify } from "querystring";

export default function createWindowRepository(window) {
  return {
    clipboard: {
      copyToClipboard: async text => {
        const el = document.createElement("textarea");
        el.value = text;
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
      }
    },
    localStorage: {
      clearEverything: async () => window.localStorage.clear()
    },
    navigation: {
      getQuery: async () => {
        const { search } = window.location;
        return parse(search.substr(1));
      },
      overrideQuery: async queryFn => {
        const { origin, pathname, search } = window.location;
        const currentURL = `${origin}${pathname}`;
        const oldQuery = parse(search.substr(1));

        const newQuery =
          queryFn instanceof Function
            ? { ...oldQuery, ...queryFn(oldQuery) }
            : { ...oldQuery, ...queryFn };

        const newSearch = `?${stringify(newQuery)}`;
        window.history.replaceState(null, null, `${currentURL}${newSearch}`);
      },
      reloadPage: async () => window.location.reload()
    }
  };
}

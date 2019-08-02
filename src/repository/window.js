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
      reloadPage: async () => window.location.reload()
    }
  };
}

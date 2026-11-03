export function initScript(): string {
  return `(function(){try{var k="theme";var c=localStorage.getItem(k);if(c!=="light"&&c!=="dark"&&c!=="auto")c="auto";var dark=c==="dark"||(c!=="light"&&matchMedia("(prefers-color-scheme: dark)").matches);var root=document.documentElement;root.dataset.theme=dark?"dark":"light";root.dataset.themeChoice=c;root.style.colorScheme=dark?"dark":"light";var theme=document.querySelector('meta[name="theme-color"]');if(theme)theme.setAttribute("content",dark?"#0f0f0f":"#fcfcfc");}catch(e){}})();`;
}

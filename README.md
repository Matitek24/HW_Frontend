# 🎨 Headwear Designer - Frontend Application

Aplikacja kliencka odpowiedzialna za interaktywne projektowanie czapek i wizualizację w czasie rzeczywistym.

[![Vue](https://img.shields.io/badge/Vue.js-3.x-4FC08D?style=flat-square&logo=vuedotjs)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)

## 🛠️ Technologie i wyzwania

W tej części projektu skupiłem się na zaawansowanej manipulacji grafiką wektorową (SVG) oraz zapewnieniu płynnego User Experience.

### Główne wyzwania:
- **Warp Transform:** Implementacja algorytmu nakładającego tekst na krzywiznę czapki przy użyciu transformacji SVG.
- **Dynamiczne renderowanie:** System komponentów Vue reagujący na każdą zmianę koloru nici czy paneli.
- **Produkcja PDF:** Generowanie profesjonalnych kart produkcyjnych bezpośrednio w przeglądarce.

## 🚀 Instalacja i uruchomienie (Local)

1. Wejdź do folderu: `cd hw_frontend`
2. Zainstaluj paczki: `npm install`
3. Uruchom serwer developerski: `npm run dev`

## 🧩 Najciekawsze komponenty

- `HatDesigner.vue` - Serce aplikacji, zarządza stanem projektu.
- `WarpTransform.js` - Autorska logika wyginania tekstów.
- `ColorPicker.vue` - Customowy komponent do wyboru kolorów nici i materiałów.

---
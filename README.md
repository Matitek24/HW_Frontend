# Headwear Konfigurator

Aplikacja do konfiugracji czapki zimowej umożliwa tworzyc customowe czapki reklamowe,

[![Vue](https://img.shields.io/badge/Vue.js-3.x-4FC08D?style=flat-square&logo=vuedotjs)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-5.x-7952B3?style=flat-square&logo=bootstrap)](https://getbootstrap.com/)
[![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?style=flat-square&logo=docker)](https://www.docker.com/)

### Technologie

Jest to frontend mojej aplikacji, zajmuje się on tym aby użytkownik który wejdzie do naszej aplikacji nie musi się logować aby jak najbardziej skrócić drogę klienta do stworzenia swojego produktu. Uzytkownik widzi dwie czapki płaską wizualizację oraz czapkę 3D **produkt który tworzy**, w aplikacji korzystamy z `JsPDF` , `Axios`, `Vite`, `Bootstrap`, `WarpTransform` oraz podstawowych mechanizmów canvas svg itp. 
Cała moja aplikacja opiera się na tworzeniu svg manipulowaniu obiektami w komponenatch `HatFront.vue` i `HatFlat.vue`

### 🧠 Kluczowe wyzwania inżynierskie

W trakcie budowy mojego projektu natknąłem się na kilka problemów, które musiałem rozwiązać:

* **Zapisywanie danych z konfiguratora:** Opracowałem system zapisu projektów łączący relacyjną bazę PostgreSQL z dynamicznymi polami JSONB. Pozwoliło to na przechowywanie nieograniczonej liczby wariantów konfiguracji czapki.
* **SVG Warp:** Zaimplementowałem logikę przekształceń matematycznych dla elementów SVG. Dzięki temu napisy nakładane na wizualizację czapki są dynamicznie dostsosowywanie do czapki
* **Karty Produkcyjne:** Stworzyłem moduł generowania kart technologicznych, który automatycznie pakuje zasoby  do dokumentu PDF aby nasza konfigurację można było przekazać do produkjci. Połączenie 
*  **Konteneryzacja i Deployment:** Skonfigurowałem pełne środowisko Dockerowe z wykorzystaniem Nginx. Rozwiązało to problemy z CORS oraz pozwoliło na błyskawiczne wdrażanie całej infrastruktury bazy danych, backendu, frontendu jedną komendą

1. **Klient** – składa zapytanie tworzy czapkę  
2. **Handlowiec** – przygotowuje ofertę
3. **Produkcja** – realizuje zamówienie z karty produkcyjenj


## Instalacja i uruchomienie (Local)

1. Wejdź do folderu: `cd hw_frontend`
2. Zainstaluj paczki: `npm install`
3. Uruchom serwer developerski na localhoscie: `npm run dev`

## Najciekawsze komponenty

- `HatDesigner.vue` - Serce aplikacji, zarządza stanem projektu cały konfigurator.
- `WarpTransform.js` - Logika wyginania tekstów.
- `ColorPicker.vue` - Customowy komponent do wyboru kolorów nici i materiałów.
- `Dashboard.vue` - panel administratora, handlowca
- `Formularz.vue` - Formularz do konfiguracji czapki

---
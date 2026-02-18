<template>
    <div class="spec-drawer-container" :class="{ 'is-open': isOpen }" ref="drawerRef">

        <div class="drawer-handle" @click="isOpen = !isOpen">
            <div class="handle-content">
                <span class="handle-text">INFORMACJE</span>
                <div class="handle-dot"></div>
            </div>
        </div>

        <div class="drawer-panel">
            <div class="drawer-header d-flex justify-content-between align-items-center">
                <h5 class="model-title">MODEL #M38-H</h5>
                <button @click="isOpen = false" class="close-btn">×</button>
            </div>

            <div class="drawer-content">

                <div class="info-block mb-5">
                    <label class="info-label">PRODUKCJA I WIZUALIZACJA</label>
                    <p class="info-text">
                        Wizualizacja ma charakter poglądowy. Ostateczna akceptacja odbywa się na podstawie przesłanego
                        programu dziewiarskiego.
                    </p>
                    <p class="info-text mt-2">
                        W przypadku braku wybranego koloru przędzy, handlowiec zaproponuje najbliższy zamiennik.
                    </p>
                </div>

                <div class="info-block mb-5 logo-section">
                    <label class="info-label text-primary">PERSONALIZACJA LOGO</label>
                    <p class="info-text fw-medium">
                        Jeśli chcesz dodać logo na wywinięcie, wyślij swoją wizualizację M38 wraz z logo do handlowca –
                        dobierzemy najlepszą metodę znakowania.
                    </p>
                </div>
                <div class="info-block">
                    <label class="info-label">INFORMACJE TECHNICZNE</label>
                       <p class="info-text fw-medium">
                        Widoczny na ekranie kolor może różnić się od faktycznego ze względu na parametry monitora.
                       </p>
                </div>
            </div>

            <footer class="drawer-footer">
                <span class="footer-brand">HEADWEAR PROFESSIONALS</span>
            </footer>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const isOpen = ref(false);
const drawerRef = ref(null);

const handleClickOutside = (event) => {
    if (isOpen.value && drawerRef.value && !drawerRef.value.contains(event.target)) {
        isOpen.value = false;
    }
};

onMounted(() => {
    document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
/* GŁÓWNY KONTENER */
.spec-drawer-container {
    position: fixed;
    left: -340px;
    top: 0;
    bottom: 0;
    width: 340px;
    background: #ffffff;
    z-index: 3000;
    transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
    border-right: 1px solid #f1f3f5;
    display: flex;
}

.spec-drawer-container.is-open {
    transform: translateX(340px);
}

.drawer-handle {
    position: absolute;
    width: 60px;
    right: -46px;
    top: 140px;
    background: #ffffff;
    height: 180px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding-right: 15px;
    cursor: pointer;
    border-radius: 0 16px 16px 0;
    border: 1px solid #f1f3f5;
    border-left: none;
    box-shadow: 10px 0 30px rgba(0, 0, 0, 0.02);
    transition: right 0.3s ease, background 0.3s ease;
    /* Animujemy 'right' zamiast 'transform' */

}

.drawer-handle:hover {
    /* Przesuwamy guzik bardziej na zewnątrz, ale zapas (szerokość 60px) maskuje szparę */
    right: -52px;
    background: #fdfdfd;
}

.handle-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
}

.handle-text {
    writing-mode: vertical-rl;
    transform: rotate(180deg);
    font-size: 11px;
    font-weight: 900;
    letter-spacing: 4px;
    color: #c1c7cd;
}

.handle-dot {
    width: 6px;
    height: 6px;
    background: #3b82f6;
    border-radius: 50%;
}

.spec-drawer-container {
    background: transparent;
    border-right: none;
}

/* PANEL */
.drawer-panel {
    padding: 50px 35px;
    width: 100%;
    display: flex;
    flex-direction: column;
    background: rgba(255, 255, 255, 0.75);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-right: 1px solid rgba(0, 0, 0, 0.05);
    z-index: 2;
}

.model-title {
    font-size: 16px;
    font-weight: 900;
    color: #1a1a1a;
    letter-spacing: -0.5px;
}

.close-btn {
    background: none;
    border: none;
    font-size: 28px;
    color: #dee2e6;
    cursor: pointer;
    line-height: 1;
}

.close-btn:hover {
    color: #1a1a1a;
}

.drawer-content {
    margin-top: 50px;
    flex-grow: 1;
}

/* TYPOGRAFIA SEKCOJI */
.info-label {
    display: block;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 1.5px;
    color: #adb5bd;
    margin-bottom: 12px;
}

.info-text {
    font-size: 12px;
    line-height: 1.6;
    color: #495057;
    margin: 0;
}

.logo-section {
    padding: 20px 0;
    border-top: 1px solid #f8f9fa;
    border-bottom: 1px solid #f8f9fa;
}

.info-list {
    list-style: none;
    padding: 0;
    margin: 0;
}

.info-list li {
    font-size: 12px;
    color: #6c757d;
    margin-bottom: 10px;
    padding-left: 15px;
    position: relative;
}

.info-list li::before {
    content: "";
    position: absolute;
    left: 0;
    top: 8px;
    width: 4px;
    height: 4px;
    background: #dee2e6;
    border-radius: 50%;
}

.drawer-footer {
    margin-top: 40px;
    text-align: center;
}

.footer-brand {
    font-size: 9px;
    font-weight: 800;
    color: #dee2e6;
    letter-spacing: 3px;
}

/* Kolor akcentowy */
.text-primary {
    color: #3b82f6 !important;
}
</style>
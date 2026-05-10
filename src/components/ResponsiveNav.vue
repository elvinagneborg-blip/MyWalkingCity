<!-- Denna komponent ansvarar för menyn, inte innehållet utan själva "ramen"-->
 <!--Oavsett vilka knappar som finns i menyn kommer menyn alltid se likadan ut-->
 <!--Importeras i headerkomponenten-->

<template>
  <nav v-bind:class="{'hide': hideNav}"> <!-- Om hideNav är sant -> gömmer den menyn -->
    <slot> <!-- Här lägger man alla sina länkar (hem, profil etc) -->
    </slot>
  </nav>
</template>

<script>

export default {
  name: 'ResponsiveNav',
  props: {
      hideNav: Boolean //sant eller falskt, fås från viewsida
  }
}
</script>

<style>

nav {
    position: absolute;
    top: calc(100% + clamp(12px, 2vw, 24px));
    left: clamp(16px, 5vw, 48px);
    right: clamp(16px, 5vw, 48px);

    background-color: #0c7f6d;
    z-index: 2000;

    border-radius: 16px 16px 0 0;
    padding: clamp(56px, 10vw, 90px) clamp(16px, 4vw, 32px) clamp(24px, 5vw, 40px);

    max-height: 75vh;
    overflow-y: auto;

    display: flex;
    flex-direction: column;
}

.hide {
    transform: translateX(100%);
  }

.menu-popup-top {
    position: absolute;
    top: 16px;
    right: 20px;
}

.menu-popup-close {
    border: none;
    background: transparent;
    color: white;
    font-size: 2rem;
    cursor: pointer;
}

.menu-popup-nav {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: clamp(22px, 5vw, 42px);
}

.menu-popup-link {
    display: flex;
    justify-content: center;
    align-items: center;

    width: min(70vw, 380px);
    min-height: clamp(58px, 10vw, 86px);

    background-color: #1da892;
    border-radius: 12px;
    border: 2px solid rgba(0,0,0,0.45);

    color: white;
    text-decoration: none;
    font-size: clamp(1.1rem, 4vw, 1.8rem);
    text-align: center;
}

/* == Telefon ==*/
@media (max-width: 600px) {
    nav {
        left: 16px;
        right: 16px;
        padding: 70px 16px 32px;
        min-height: calc(100vh - 150px);
    }

    .menu-popup-nav {
        gap: 32px;
    }

    .menu-popup-link {
        width: 75%;
        min-height: 70px;
        font-size: 1.4rem;
        text-align: center;
    }}
   
</style>

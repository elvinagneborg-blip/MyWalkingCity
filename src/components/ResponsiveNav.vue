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

/*Viss dubbelogik men fick det inte att funka*/

/*Layout för menyn*/
nav {
    position: fixed;
    top: 95px;
    left: 50%;
    transform: translateX(-50%);
    width: min(92vw, 980px);
    max-width: 980px;
    min-height: 420px;
    max-height: 78vh;
    background-color: #0c7f6d;
    z-index: 2000;
    border-radius: 16px;
    padding: 40px 32px 78px;
    box-sizing: border-box;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}
.hide {
    visibility: hidden;
  }

  /* x button*/
.menu-popup-close {
    position: absolute;
    top: 10px;
    right: 20px;
    border: none;
    background: transparent;
    color: white;
    font-size: 2rem;
    cursor: pointer;
}

/* Routerlink - buttons */
.menu-popup-nav {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: clamp(18px, 4vh, 42px);
}
.menu-popup-link {
    display: flex;
    justify-content: center;
    align-items: center;
    width: min(68vw, 420px);
    min-height: clamp(52px, 8vh, 76px);
    background-color: #1da892;
    border-radius: 12px;
    border: 2px solid rgba(0,0,0,0.45);
    color: white;
    text-decoration: none;
    font-size: clamp(1.1rem, 3vw, 1.7rem);
    text-align: center;
    line-height: 1.1;
    padding: 6px 12px;
    box-sizing: border-box;
}

/*Dubbellogik men datorskärm */
@media (min-width: 601px) {
    nav {
        top: 90px;
        width: min(52vw, 680px);
        max-height: calc(100vh - 120px);
        padding: 34px 32px 110px;
    }

    .menu-popup-nav {
        gap: 28px;
    }

    .menu-popup-link {
        width: min(42vw, 500px);
        min-height: 64px;
        font-size: 1.45rem;
    }
}

/* Telefonskärm */
@media (max-width: 600px) {
    nav {
        top: 100px;
    }
}
</style>

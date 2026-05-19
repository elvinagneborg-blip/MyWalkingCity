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

/*Layout för Popup-menyn*/
nav {
    position: fixed;
    top: 95px;
    left: 50%;
    transform: translateX(-50%);
    width: clamp(420px, 52vw, 680px);    
    min-height: 420px; /*boven?*/
    max-height: 78vh;
    background-color: #0c7f6d;
    z-index: 2000;
    border-radius: 16px;
    padding: 40px 32px 40px;
    box-sizing: border-box;
    overflow: auto;
    display: flex;
    flex-direction: column;
}
.hide {
    visibility: hidden;
  }

  /* x button*/
.menu-popup-close {
    position: fixed;
    top: 14px;
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
    justify-content: center; /* centrera knapparna vertikalt */
    flex: 1; /* fyll ut nav-containern */

}
.menu-popup-link {
    display: flex;
    justify-content: center;
    align-items: center;
    width: min(82%, 420px);
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

/* Telefonskärm */
@media (max-width: 600px) {
    nav {
        top: 100px;
        min-height: auto;
        width: min(92vw, 420px);
        padding: 48px 18px 24px;
        overflow-y: auto;
    }

    .menu-popup-nav {
        gap: 14px;
        justify-content: flex-start;
    }

    .menu-popup-close {
        top: 8px;
        right: 16px;
        font-size: 1.8rem;
    }
}
</style>

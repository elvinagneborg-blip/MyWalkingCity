<template>
    <footer class="web-footer">
        <div class="footer-layout">

            <!--Collaboration / contact -->
            <section class="footer-column footer-collaboration">
                <h3>{{ uiLabels.footerCollaboration }}</h3>
                    <img
                        class="SIC-logo"
                        src="/img/cropped-SIC-2.png"
                        alt="Sustainability InnoCenter logo" 
                    >

                <div class="footer-contact-block">
                    <p class="footer-contact-label">✉️ Email</p>
                        <a class="footer-link" href="mailto:info@sustainabilityinnocenter.com">
                            info@sustainabilityinnocenter.com
                        </a>
                </div>

                <div class="footer-contact-block">
                    <p class="footer-contact-label">LinkedIn</p>
                        <a
                            class="footer-link"
                            href="https://www.linkedin.com/company/sustainability-innocenter/"
                            target="_blank"
                        >
                            Sustainability InnoCenter
                        </a>
                </div>
            </section>

            <!--Project description-->
            <section class="footer-column footer-about" >
                <h3> My Walking City </h3>
                    <p class=" footer-about-text"> 
                        {{ uiLabels.myWalkinCityAbout }}
                    </p>

                    <!-- kolla vad gruppen känner / rättigheter-->
                <div class="footer-about-logos">
                   
                   <!-- <img
                        class="footer-about-logo"
                        src="/img/sts-logo.png"
                        alt="STS logo" 
                    >

                    <img
                        class="footer-about-logo"
                        src="/img/uppsala-logo.png"
                        alt="UU logo" 
                    > -->
                </div>
            </section>
        </div>

        <!--CopyWrite-->
        <div class="footer-bottom">
            {{ uiLabels.copywrite }}
        </div>
    </footer>
</template>

<script setup>
import { ref, watch } from 'vue'
import io from 'socket.io-client'

const props = defineProps([
  'backendURL',
  'currentLang'
])

const socket = io(props.backendURL)
const uiLabels = ref({})

socket.on('uiLabels', (labels) => {
  uiLabels.value = labels
})

watch(
  () => props.currentLang,
  (newLang) => {
    socket.emit('getUILabels', newLang || 'en')
  },
  { immediate: true }
)
</script>

<style scoped>



/* == Footer base ==*/
.web-footer {
    width: 100%;
    background-color: #242424;
    color: #d2cece;
    font-family: Helvetica, Arial, sans-serif;
}

.footer-layout {
    width: min(92%, 1000px);
    margin: 0 auto;
    padding: 36px 20px 36px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 90px;
}

.footer-column {
    flex: 1;
}

.footer-column h3 {
    margin: 0 0 22px;
    font-size: 1.4rem;
    font-weight: 700;
    color: #99f1e8;
}

/* == Collab / contact ==*/
.footer-collaboration {
    text-align: left;
}

.SIC-logo {
    display: block;
    max-width: 260px;
    height: auto;
    margin: 0 0 20px;
}

.footer-contact-block {
    margin: 22px auto 0;
    text-align: left;
}

.footer-contact-label {
    margin: 0 0 6px;
    color: #99f1e8;
    font-size: 0.9rem;
    font-weight: 600;
}

.footer-link {
    display: block;
    color: #d2cece;
    text-decoration: none;
    font-size: 0.95rem;
}

.footer-link:hover {
    color: #20c7b5;
}

/* == About us ==*/
.footer-about-text {
    font-size: 1rem;
    line-height: 1.4;
    max-width: 460px;
    text-align: center;
    color: #dddddd;
    margin: 1rem auto 1.5rem;
}

.footer-about-logos {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1.5rem;
    flex-wrap: wrap;
}

.footer-about-logo {
    max-height: 55px;
    max-width: 180px;
    object-fit: contain;
}

/* == Cw == */
.footer-bottom {
    width: min(92%, 1100px);
    margin: 18px auto 0;
    padding-top: 16px;
    border-top: 1px solid rgba(255, 255, 255, 0.18);
    text-align: center;
    color: #cfcfcf;
    font-size: 0.9rem;
}

/* == Telefon ==*/

@media (max-width: 768px) {
    .footer-layout {
        flex-direction: row;
        align-items: flex-start;
        text-align: center;
        gap: 18px;
        padding: 26px 14px 28px;
    }

    .footer-column {
        flex: 1;
        width: auto;
    }

    .footer-column h3 {
        font-size: 1rem;
        white-space: nowrap;
    }

    .SIC-logo {
        max-width: 120px;
        margin-bottom: 18px;
    }

    .footer-contact-block {
        margin: 14px 0 0;
    }

    .footer-contact-label {
        font-size: 0.78rem;
        margin-bottom: 4px;
    }

    .footer-link {
    font-size: 0.58rem;
    }

    .footer-about-text {
        font-size: 0.72rem;
        line-height: 1.35;
        margin: 0.5rem 0 0;
        text-align: center;
    }

    .footer-bottom {
        margin-top: 0;
        padding-top: 10px;
        font-size: 0.68rem;
        line-height: 1.3;
    }
}
</style>




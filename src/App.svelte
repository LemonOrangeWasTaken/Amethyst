<script lang="ts">
</script>

<main>
    <section>
        <h1 id="glo">Amethyst</h1>
        <h1 id="real">Amethyst</h1>
    </section>
</main>

<style lang="scss">
    main{
        background-color:hsl(0,0%,98%);
        display: flex; flex-direction: column; justify-content: center; align-items: center;
        height:100vh; width:100vw;
        
        section{
            position:relative;

            h1{
                font-size: 10em;
                padding-bottom:10pt;
            }
            #real{
                position:absolute; top:0; left:0;
                color:hsl(0,0%,100%)
            }
            #glo{
                background-color:#ff99db;
                background-image:
                radial-gradient(at 45% 73%, hsla(225,94%,76%,1) 0px, transparent 50%),
                radial-gradient(at 62% 15%, hsla(6,97%,63%,1) 0px, transparent 50%),
                radial-gradient(at 0% 3%, hsla(95,90%,76%,1) 0px, transparent 50%),
                radial-gradient(at 79% 19%, hsla(286,88%,61%,1) 0px, transparent 50%),
                radial-gradient(at 15% 21%, hsla(144,99%,77%,1) 0px, transparent 50%),
                radial-gradient(at 4% 16%, hsla(224,87%,70%,1) 0px, transparent 50%),
                radial-gradient(at 11% 82%, hsla(265,74%,61%,1) 0px, transparent 50%);
                background-clip:text;
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;

                filter: blur(7pt);
            }
        }
    }
</style>
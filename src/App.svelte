<script lang="ts">
</script>

<main>
    <section>
        <h1>Amethyst</h1>
        <p>CSS styling made easy</p>
    </section>
</main>

<style lang="scss">
    $accent: hsla(270,100%,50%,100%);

    main{
        background-color:hsl(200,5%,8%);
        display: flex; flex-direction: column; justify-content: center; align-items: center;
        height:100vh; width:100vw;
        
        section{
            perspective: 175px;
            position: relative;

            h1{
                color:hsl(0,0%,95%);
                font-size: 10em;
            }

            p{
                color:hsl(270,90%,70%);
                font-size: 2em;
                font-weight: 300;
            }
        }
    }
</style>
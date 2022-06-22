<script lang="ts">
    export let leftMenuWidth:number;
    export let rightMenuWidth:number;
</script>

<!-- HTML -->
<main style="width:calc(100vw - {leftMenuWidth-1}px - {rightMenuWidth}px); left: {leftMenuWidth+1}px">
	<section id="index-load">
		<div id="bar">
			<div id="knob"></div>
		</div>
	</section>
</main>

<!-- STYLE -->
<style lang="scss">
    @import "../public/global";

    main{
        height:calc(100vh - 65px);
        background:none;
        position: absolute; top:65px;
        display: flex; justify-content: center; align-items: center; flex-direction: column;

        #index-load{
            display: flex; justify-content: center; align-items: center;

            #bar{
                width:60pt; height:10pt;
                background-color: $secondarys6;
                border-radius: 100pt;
                overflow: hidden;

                #knob{
                    height:100%;
                    width:25pt;
                    background-color: $secondarys1;
                    border-radius: 100pt;
                    animation: load 1s infinite linear;
                }

                @keyframes load {
                    0% {transform: translate3d(0pt,0,0);}
                    50% {transform: translate3d(calc(60pt - 25pt),0,0);}
                    100% {transform: translate3d(0pt,0,0);}
                }
            }
        }
    }
</style>
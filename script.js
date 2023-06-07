
/**
 * This class is in charge of handling the interaction with the AR experience through the EmbedSDK.
 */
class OxExperience {

    /**
     * Constructor
     * Initialize the embedSDK
     * 
     * @param   embedsdk allows you to lister to events and control the scene content
     */
    constructor(embedSDK) {
        this.embedSDK = embedSDK;
    }
    
    /**
     * Play the success sound
     */
    playSuccess() {
        this.embedSDK.play("success");
    }
}

/**
 * This class is in charge of handling the interaction with the custom html and css code.
 */
class OxExperienceUI{
    /**
     * Indicates the number of scenes available
     */
    TOTAL_SCENES = 3;

    /**
     * Points per each chest catched
     */
    SCORE_PER_CHEST = 25;

    /**
     * Number of chest a scene can have
     */
    TOTAL_CHESTS_PER_SCENE = 3;
    

     /**
     * HTML elements ids
     */
    CLOSE_BUTTON = document.getElementById("close-button");
    LOCATION_BUTTON = document.getElementById("location-button");
    FINAL_SCREEN = document.getElementById("score-overlay");
    FINAL_SCORE = document.getElementById("strong-score");

    /**
     * Used to store the scenes and the score
     */
    localStorage = window.localStorage;
    
    /**
     * Actual scene
     */
    sceneOid = '';

    /**
     * Application state
     */
    state = {
        score: 0,
        sceneCollectedChests: 0
    };

    /**
     * All scenes already played
     */
    collectedScenes = [];


    /**
    * Called when a chest is clicked. It adds 25 to the user score, and 
    * when all 3 are clicked, it shows the end screen
    */
    handleChestClick() {
        this.state.score = this.state.score + this.SCORE_PER_CHEST;
        this.state.sceneCollectedChests++;

        if (this.state.sceneCollectedChests == this.TOTAL_CHESTS_PER_SCENE) {
            
            if(this.localStorage.getItem("score")!=null){
                let final_score= parseInt(this.localStorage.getItem("score")) + parseInt(this.state.score)
                this.localStorage.setItem("score", final_score)

            }else{
                this.localStorage.setItem("score", this.state.score)
            }
            this.FINAL_SCORE.innerHTML = this.localStorage.getItem("score");
            this.FINAL_SCREEN.style.display = "block";
            this.collectedScenes.push(this.sceneOid)
            this.localStorage.setItem("collectedScenes", JSON.stringify(this.collectedScenes));
            this.onPlaySuccess();
        }
    }
    
    /**
     * Delete from the map the scenes already played
     */
    removePlayedScenes() {
        const collectedScenes = JSON.parse(localStorage.getItem('collectedScenes'));
        if (collectedScenes != null) {
            for (let i = 0; i < collectedScenes.length; i++) {
                document.head.appendChild(document.createElement("style")).innerHTML = `.ox-map-location-wrapper--${collectedScenes[i]} { display: none }`;
                document.head.appendChild(document.createElement("style")).innerHTML = `.ox-location-panel--${collectedScenes[i]} { display: none }`;
            }
            const geolocated_menu_bottom = document.getElementById("webar-geolocated-menu-button");
            if (geolocated_menu_bottom != null) {
                let remaining = this.TOTAL_SCENES - collectedScenes.length;
                let spans = document.getElementById("webar-geolocated-menu-button").getElementsByTagName("span");
                spans[0].innerHTML = remaining;

                document.getElementById("webar-geolocated-menu-button").addEventListener("click", () => {
                    let locationsMenu = document.getElementById("webar-geolocated-locations-panel").getElementsByTagName("span");
                    locationsMenu[0].innerHTML = remaining;
                });
            }
        }
    }

    /**
     * Add functionality to the UI and get the actual played scenes
     */
    initUi() {
        if (JSON.parse(localStorage.getItem('collectedScenes')) != null) {
            this.collectedScenes = JSON.parse(localStorage.getItem('collectedScenes'));
        }
        this.CLOSE_BUTTON.addEventListener("click", () => {
            this.FINAL_SCREEN.style.display = "none";
            window.location.reload();
        });

        this.LOCATION_BUTTON.addEventListener("click", () => {
            this.FINAL_SCREEN.style.display = "none";
            window.location.reload();
        });
    }
}

/**
 * Onirix Embed SDK allows you to listen to events and control the scene when embedding experiences in a custom domain or from the online code editor.
 * For more information visit https://docs.onirix.com/onirix-sdk/embed-sdk
 */

import OnirixEmbedSDK from "https://unpkg.com/@onirix/embed-sdk@1.2.3/dist/ox-embed-sdk.esm.js";
const embedSDK = new OnirixEmbedSDK();
await embedSDK.connect();
const oxExperience = new OxExperience(embedSDK);
const oxExperienceUi = new OxExperienceUI();

    /**
     * Removes already played scenes from the map.
     * It must be executed at the beginning when the map is displayed.
     */
    oxExperienceUi.removePlayedScenes();

    /**
     * Comunicates oxExperience UI and oxExperience to play the success sound
     */
    oxExperienceUi.onPlaySuccess = () => {
        oxExperience.playSuccess();
    }

    /**
     * Will be triggered when all permissions are accepted and the camera becomes visible
     */
    embedSDK.subscribe(OnirixEmbedSDK.Events.READY, (params) => {
        oxExperienceUi.state.sceneCollectedChests = 0;
    });

    /**
     * It's execute when a element of the scene is clicked.
     */
    embedSDK.subscribe(OnirixEmbedSDK.Events.ELEMENT_CLICK, (params) => {
        if (params.name.includes('Chest')) {
            oxExperienceUi.handleChestClick();
        }
    });

    /**
     * It's execute when the scene is totally load and it start the game
     */
    embedSDK.subscribe(OnirixEmbedSDK.Events.SCENE_LOAD_END, (params) => {
        oxExperienceUi.sceneOid = params.oid;
        oxExperienceUi.initUi();
    });
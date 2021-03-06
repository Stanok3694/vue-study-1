Vue.use(Vuetify)

new Vue({
    el:"#app",
    data:{
        playerName: 'Player',
        
        playerHealth: 100,
        monsterHealth: 100,
        
        playerTotalDamage: 0,
        playerTotalHeal: 0,
        monsterTotalDamage: 0,

        attachDisabled: false,
        showStartPanel: true,
        showMainPanel: false,
        showStatistic: false,
        showLog: false,

        isPlayerTurn: false,
        isMonsterTurn: false,
        
        giveUpFlag: true,
        gameOver: false,

        currentState: '',
        
        turns: [],
        stats: []
    },
    methods:{
        // main game logic section
        startGame: function () {
            this.toggleControlPanel();
            this.toggleInfoPanel();

            this.resetHealthbars();
            this.resetTurnStack();
            this.resetStatData();

            this.currentState = 'begin';
            this.setLogElementsInTurns(this.currentState);          
        },
        finishGame: function(){
           this.showMainPanel = false;
           this.showLog = true;
           this.gameOver = true; 
        },
        attack: function () {
            this.playerTurn(3,12);
            if(this.winStatus()){
                return;
            }
            this.monsterTurn(5,12);
            this.winStatus();      
        },
        specialAttack: function () {
            this.playerTurn(5,12);
            if(this.winStatus()){
                return;
            }
            this.monsterTurn(8,22);
            this.winStatus(); 
        },
        heal: function () {
            var dealHeal = 10;

            if (this.playerHealth <= 90){
                this.playerHealth += dealHeal;
            } else {
                this.playerHealth = 100;
            }

            this.playerTotalHeal += dealHeal;

            this.currentState = 'heal';
            this.setLogElementsInTurns(this.currentState);
            this.setPlayerChangeClassFlags();
            this.monsterTurn(5,12);
        },
        giveUp: function () {
            this.showMainPanel = false;
            this.gameOver = true;
            this.showLog = true;

            this.currentState = 'lose';
            this.setStatistic(this.currentState);
            this.setLogElementsInTurns(this.currentState);
        },
        // gameplay service section
        playerAttack: function(min, max){
            var dealDamage = this.calculateDamage(min,max);
            this.monsterHealth -= dealDamage;

            this.playerTotalDamage += dealDamage;

            this.currentState = 'player-attack';
            this.setLogElementsInTurns(this.currentState, dealDamage);
        },
        monsterAttack: function(min,max){
            var dealDamage = this.calculateDamage(min,max);
            this.playerHealth -= dealDamage;

            this.monsterTotalDamage += dealDamage;
            
            this.currentState = 'monster-attack';
            this.setLogElementsInTurns(this.currentState, dealDamage);
        },
        calculateDamage: function (min, max) {
            return Math.max(Math.floor(Math.random() * max) + 1, min);
        },
        winStatus: function() {
            if(this.monsterHealth <= 0){
                this.monsterHealth = 0;
                this.currentState = 'win';

                this.finishGame();
                this.setStatistic(this.currentState);
                this.setLogElementsInTurns(this.currentState);
                
                return true;
            }else if (this.playerHealth <= 0){
                this.playerHealth = 0;
                this.currentState = 'lose';
                
                this.finishGame();
                this.setStatistic(this.currentState);
                this.setLogElementsInTurns(this.currentState);

                return true;
            }
            return false;
        },
        playerTurn: function(min, max) {
            this.playerAttack(min,max);
            this.setPlayerChangeClassFlags();           
        },
        monsterTurn: function (min, max) {
            setTimeout(()=>{
                monsterComplex()
            }, 500);

            var monsterComplex = function(){
                this.monsterAttack(min,max);
                this.setMonsterChangeClassFlag();
            }.bind(this)
        },
        // additional service section
        setLogElementsInTurns: function (currentState, additionalInfo) {
            if(currentState == 'begin') {
                this.turns = [];
                this.turns.unshift({
                    text: 'Battle begins...',
                    classFlag: currentState
                })
            }
            if(currentState == 'player-attack') this.turns.unshift({
                text: 'Player hits Monster for ' + additionalInfo,
                classFlag: currentState
            })
            if(currentState == 'monster-attack') this.turns.unshift({
                text: 'Monster hits Player for ' + additionalInfo,
                classFlag: currentState
            })
            if(currentState == 'heal') {
                this.turns.unshift({
                    text: 'Player heals himself for 10',
                    classFlag: currentState
                });
            }
            if(currentState == 'win'){
                this.turns = [];
                this.turns.unshift({
                    text: 'Glory day! You won in your battle!',
                    classFlag: currentState
                });
            }
            if(currentState == 'lose'){
                this.turns = [];
                this.turns.unshift({
                    text: 'No glory - no mercy! You lost your own battle!',
                    classFlag: currentState
                })
            }
        },
        // set classes section
        setClass: function (classFlag) {
            if(classFlag == 'begin') return classFlag
            if(classFlag == 'player-attack') return classFlag
            if(classFlag == 'monster-attack') return classFlag
            if(classFlag == 'heal') return classFlag
            if(classFlag == 'win') return classFlag
            if(classFlag == 'lose') return classFlag 
        },
        setPlayerCardClass: function(){
            if(this.isPlayerTurn == true) return 'turn-player'
        },
        setMonsterCardClass: function(){
            if(this.isMonsterTurn == true) return 'turn-monster'
        },
        setPlayerChangeClassFlags: function(){
            this.attachDisabled = true;
            this.isPlayerTurn = true;
            this.isMonsterTurn = false;
        },
        setMonsterChangeClassFlag: function(){
            this.attachDisabled = false;
            this.isPlayerTurn = false;
            this.isMonsterTurn = true;
        },
        // statistic section
        setStatistic: function(currentState) {
            if(currentState == 'lose'){
                this.stats.unshift({
                    text: 'You DEAL ' + this.playerTotalDamage 
                          + ' damage, but You RECEIVE '
                          + this.monsterTotalDamage
                          + ' and HEAL only '
                          + this.playerTotalHeal
                          + ' so that is the reason of YOUR DEFEAT!'
                });
            }
            if(currentState == 'win'){
                this.stats.unshift({
                    text: 'You DEAL ' + this.playerTotalDamage 
                          + ' damage, but You RECEIVE '
                          + this.monsterTotalDamage
                          + ' and HEAL as many as '
                          + this.playerTotalHeal
                          + ' so that is the reason of YOUR TOTAL WIN!'
                });
            }
        },
        getStatistic: function(){
            this.showStatistic = !this.showStatistic;
        },
        // reset data section
        resetStatData: function(){
            this.playerTotalDamage = 0;
            this.playerTotalHeal = 0;
            this.monsterTotalDamage = 0;

            this.stats = [];
        },
        resetHealthbars: function(){
            this.playerHealth = 100;
            this.monsterHealth = 100;
        },
        resetTurnStack: function(){
            this.isPlayerTurn = false,
            this.isMonsterTurn = false
        },
        // panel visible section
        toggleControlPanel: function(){
            this.showMainPanel = true;
            this.showStartPanel = false;
            this.gameOver = false;
        },
        toggleInfoPanel: function(){
            this.showStatistic = false;
            this.showLog = true;
        }
    }
})
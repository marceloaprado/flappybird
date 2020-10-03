var canvas,
ctx,
ALTURA,
LARGURA,
velocidade = 5,
estadoAtual,
record,
fps, 
fpsInterval, 
startTime, 
now, 
then, 
elapsed;

estados = {
	jogar: 0,
	jogando: 1,
	perdeu: 2
},

chao = {
	y: 550,
	x: 0,
	altura: 50,

	atualiza: function(){
		this.x -= velocidade;
		if(this.x < -30){
			this.x = 0;
		}
	},

	desenha: function(){
		spriteChao.desenha(this.x, this.y);	
		spriteChao.desenha(this.x + spriteChao.largura, this.y);	
	}
},

ceu = {
	y: 0,
	x: 0,

	atualiza: function() {
		this.x -= velocidade / 2;

		if(this.x < -LARGURA + 1){
			this.x = 0;
		}
	},

	desenha: function(){	
		spriteCeu.desenha(this.x, this.y);
		spriteCeu.desenha(this.x + spriteCeu.largura, this.y);
	}
},

gameOver = {
	x: 0,
	y: 0,

	desenha: function(){
		spriteGameOver.desenha(this.x, this.y);
	}

},

contador = 0,
personagem = {
	x: 50,
	y: 300 - spritePersonagem.altura,
	altura: spritePersonagem.altura,
	largura: spritePersonagem.largura,
	gravidade: 1.2,
	velocidade: 0,
	forcaDoPulo: 15,
	score: 0,
	pulando : 0,
	caindo: 0,
	parado: 0,

	atualiza: function(){
		if(this.pulando && estadoAtual == estados.jogando)
			posicao = 2;

		if(this.caindo && estadoAtual == estados.jogando)
			posicao = 0;

		if(this.parado && estadoAtual == estados.jogando)
			posicao = 1;

		if(estadoAtual != estados.jogar && this.y + this.altura < chao.y){
			this.velocidade += this.gravidade;
			this.y += this.velocidade;
		}	
		
		if(this.velocidade >= 0 && estadoAtual == estados.jogando){
			this.caindo = 1;
			this.pulando = 0;
			this.parado = 0;
		}
		
		if(this.y + this.altura > chao.y)
			estadoAtual = estados.perdeu;
			
		if(estadoAtual == estados.jogar){
			contador++;
			/*Aqui eh realizado a troca da imagem da sprite do personagem.
			Essa verificacao eh feita para dar um delay durante a troca de 
			imagens de forma que fique mais facil de ser visualizada*/
			if(contador % 10 == 0){
				posicao++;
				if(posicao == 3)
					posicao = 0;
					
				contador = 0;
			}							
		}
	},

	pula: function(){
		this.velocidade = -this.forcaDoPulo;
		this.pulando = 1;
		this.caindo = 0;
		this.parado = 0;
	},

	reset: function(){
		this.y = 300 - spritePersonagem.altura;
		this.velocidade = 0;

		if(this.score > record){
			localStorage.setItem("record", this.score);
			record = this.score;
		}
		this.score = 0;
	},

	desenha: function(){
		spritePersonagem.desenha(this.x, this.y);
	}
},

obstaculos = {
	_obs: [],
	tempoInsere: 0,

	insere: function(){
		this._obs.push({
			x: LARGURA, 
			largura: 86, 
			altura: 50 + Math.floor(250 * Math.random())
		});
		this.tempoInsere = 80 + Math.floor(21 * Math.random());
	},

	atualiza: function(){
		if(this.tempoInsere == 0)
			this.insere();
		else
			this.tempoInsere--;

		for(var i = 0, tam = this._obs.length; i < tam; i++){
			var obs = this._obs[i];
			obs.x -= velocidade;

			if(personagem.x < obs.x + obs.largura && personagem.x + personagem.largura >= obs.x && 
			  (personagem.y + personagem.altura >= chao.y - obs.altura - 28 || personagem.y <= chao.y - obs.altura - 200))			
				estadoAtual = estados.perdeu;
			else
				if(obs.x == personagem.x)
					personagem.score++;
				else
					if(obs.x <= -obs.largura){
						this._obs.splice(i, 1);
						tam--;
						i--;
					}
		}

	},

	limpa: function(){
		this._obs = [];
	},

	desenha: function(){
		for(var i = 0; i < this._obs.length; i++){
			var obs = this._obs[i];
			desenhaObstaculos(obs.x, 0, chao.y - obs.altura - 200, "I");
			desenhaObstaculos(obs.x, chao.y - obs.altura, chao.y, "N");
		}
	}
};

window.onload = function(){
	main(60);
}

function main(fps){
	ALTURA = window.innerHeight;
	LARGURA = window.innerWidth;
	fpsInterval = 1000 / fps;
    then = Date.now();
    startTime = then;    

	if(LARGURA >= 500)
		LARGURA = ALTURA = 600;
	
	canvas = document.createElement("canvas");
	canvas.width = LARGURA;
	canvas.height = ALTURA;
	canvas.style.border = "1px solid #000";

	ctx = canvas.getContext('2d');
	document.body.appendChild(canvas);	

	document.addEventListener("mousedown", clique);

	estadoAtual = estados.jogar;

	roda();
}

function roda(){
	window.requestAnimationFrame(roda);

	now = Date.now();
    elapsed = now - then;

    if (elapsed > fpsInterval) {
        then = now - (elapsed % fpsInterval);

		record = localStorage.getItem("record");

		if(record == null)
			record = 0;
		
		atualiza();
		desenha();
    }
}

function clique(e){
	personagem.pula();
	
	if(estadoAtual == estados.jogando){
		personagem.pula();
	}
	else
		if(estadoAtual == estados.jogar){
			estadoAtual = estados.jogando;
		}
		else{			
			estadoAtual = estados.jogar;
			personagem.reset();
			obstaculos.limpa();			
		}
}

function atualiza(){
	if(estadoAtual == estados.jogando)
		obstaculos.atualiza();

	ceu.atualiza();
	personagem.atualiza();
	chao.atualiza();	
}

function desenha (){
	ceu.desenha();
	obstaculos.desenha();	

	ctx.fillStyle = "rgba(255, 255, 255, 0.2)";	
	ctx.fillRect(LARGURA / 2 - 60, 0, 120, 50);

	ctx.font = "45px Arial";
	desenhaScore(40, "#FFF", personagem.score);

	chao.desenha();	
	personagem.desenha();	
	if(estadoAtual == estados.perdeu){
		gameOver.desenha();

		desenhaScore(315, "#000", personagem.score);
		desenhaScore(410, "#000", record);
	}
}

function desenhaObstaculos(x, y, altura, indicador){
	//Indicador N = Normal, e I = Invertido
	if(indicador == "N"){	
		parteInferiorOb(x, y, altura);	
		parteSuperiorOb(x, y);
	}
	else{
		parteInferiorOb(x, 0, altura);
		parteSuperiorOb(x, altura);
	}	
}

function desenhaScore(y, cor, valor){
	ctx.fillStyle = cor;
	if(valor < 10)
		ctx.fillText(valor, LARGURA / 2 - 10, y);
	else
		if(valor >= 10 && valor < 100)
			ctx.fillText(valor, LARGURA / 2 - 20, y);
		else
			ctx.fillText(valor, LARGURA / 2 - 35, y);
}

function parteSuperiorOb(x, y){
	//Parte de cima do cano
	ctx.fillStyle = "#005e04";
	ctx.beginPath();
	ctx.rect(x - 12, y - 25, 3, 25);	
	ctx.fill();
	ctx.closePath();

	ctx.fillStyle = "#00820e";
	ctx.beginPath();
	ctx.rect(x - 9, y - 25, 9, 25);	
	ctx.fill();
	ctx.closePath();

	ctx.fillStyle = "#009310";
	ctx.beginPath();
	ctx.rect(x, y - 25, 2, 25);	
	ctx.fill();
	ctx.closePath();

	ctx.fillStyle = "#00820e";
	ctx.beginPath();
	ctx.rect(x + 2, y - 25, 2, 25);	
	ctx.fill();
	ctx.closePath();

	ctx.fillStyle = "#00ad13";
	ctx.beginPath();
	ctx.rect(x + 4, y - 25, 36, 25);	
	ctx.fill();
	ctx.closePath();

	ctx.fillStyle = "#00d818";
	ctx.beginPath();
	ctx.rect(x + 40, y - 25, 12, 25);	
	ctx.fill();
	ctx.closePath();

	ctx.fillStyle = "#00c016";
	ctx.beginPath();
	ctx.rect(x + 52, y - 25, 3, 25);	
	ctx.fill();
	ctx.closePath();

	ctx.fillStyle = "#00d818";
	ctx.beginPath();
	ctx.rect(x + 55, y - 25, 4, 25);	
	ctx.fill();
	ctx.closePath();

	ctx.fillStyle = "#00c717";
	ctx.beginPath();
	ctx.rect(x + 59, y - 25, 12, 25);	
	ctx.fill();
	ctx.closePath();

	ctx.fillStyle = "#005e04";
	ctx.beginPath();
	ctx.rect(x + 71, y - 25, 3, 25);	
	ctx.fill();
	ctx.closePath();

	ctx.fillStyle = "#005e04";
	ctx.beginPath();
	ctx.rect(x - 12, y - 28, 86, 3);	
	ctx.fill();
	ctx.closePath();

	ctx.fillStyle = "#005e04";
	ctx.beginPath();
	ctx.rect(x - 12, y, 86, 3);	
	ctx.fill();
	ctx.closePath();
	//Fim parte de cima do Cano
}

function parteInferiorOb(x, y, altura){
	//Parte de baixo do Cano
	ctx.fillStyle = "#005e04";
	ctx.beginPath();
	ctx.rect(x, y, 3, altura);	
	ctx.fill();
	ctx.closePath();

	ctx.fillStyle = "#00820e";
	ctx.beginPath();
	ctx.rect(x + 3, y, 9, altura);	
	ctx.fill();
	ctx.closePath();

	ctx.fillStyle = "#00a312";
	ctx.beginPath();
	ctx.rect(x + 12, y, 2, altura);	
	ctx.fill();
	ctx.closePath();

	ctx.fillStyle = "#008b0f";
	ctx.beginPath();
	ctx.rect(x + 14, y, 2, altura);	
	ctx.fill();
	ctx.closePath();

	ctx.fillStyle = "#00b114";
	ctx.beginPath();
	ctx.rect(x + 16, y, 20, altura);	
	ctx.fill();
	ctx.closePath();

	ctx.fillStyle = "#00d818";
	ctx.beginPath();
	ctx.rect(x + 36, y, 12, altura);	
	ctx.fill();
	ctx.closePath();

	ctx.fillStyle = "#00c016";
	ctx.beginPath();
	ctx.rect(x + 48, y, 3, altura);	
	ctx.fill();
	ctx.closePath();

	ctx.fillStyle = "#00d818";
	ctx.beginPath();
	ctx.rect(x + 51, y, 4, altura);	
	ctx.fill();
	ctx.closePath();

	ctx.fillStyle = "#00c717";
	ctx.beginPath();
	ctx.rect(x + 55, y, 5, altura);	
	ctx.fill();
	ctx.closePath();

	ctx.fillStyle = "#005e04";
	ctx.beginPath();
	ctx.rect(x + 60, y, 3, altura);	
	ctx.fill();
	ctx.closePath();

	ctx.fillStyle = "#005e04";
	ctx.beginPath();
	ctx.rect(x, y, 62, 3);	
	ctx.fill();
	ctx.closePath();

	ctx.fillStyle = "#005e04";
	ctx.beginPath();
	ctx.rect(x, y + altura, 63, 3);	
	ctx.fill();
	ctx.closePath();
	//Fim parte de baixo do Cano
}
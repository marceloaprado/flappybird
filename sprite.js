var img = new Image(),
imgGameOver = new Image();

img.src = "imagens/sprite.png";
imgGameOver.src = "imagens/game_over.png";

var posicao = 0;

var spriteCeu = new Sprite(img, 0, 0, 600, 600),
spritePersonagem = new SpritePersonagem(img, 0, 65, 46),
spriteChao = new Sprite(img, 616, 97, 600, 56),
spriteGameOver = new Sprite(imgGameOver, 0, 0, 600, 600);

function Sprite(img, x, y, largura, altura){
	this.img = img;
	this.x = x;
	this.y = y;
	this.largura = largura;
	this.altura = altura;

	this.desenha = function(xCanvas, yCanvas){
		ctx.drawImage(this.img, this.x, this.y, this.largura, this.altura, xCanvas, yCanvas, this.largura, this.altura);
	}
}

function SpritePersonagem(img, y, largura, altura){
	this.img = img;
	this.y = y;
	this.largura = largura;
	this.altura = altura;

	this.desenha = function(xCanvas, yCanvas){
		ctx.drawImage(this.img, 616 + posicao * 65, this.y, this.largura, this.altura, xCanvas, yCanvas, this.largura, this.altura);
	}
}
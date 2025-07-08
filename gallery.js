const teamMembers = [
	{ name: "糸师冴", role: "蓝色监狱BLUELOCK" },
	{ name: "Harry Potter", role: "Harry Potter" },
	{ name: "花京院典明", role: "JOJO的奇妙冒险" },
	{ name: "花京院典明", role: "JOJO的奇妙冒险" },
	{ name: "江尤娜", role: "坏想法日记" },
	{ name: "Harry Potter", role: "Harry Potter" },
    { name: "袁基", role: "代号鸢" },
	{ name: "袁基", role: "代号鸢" },
	{ name: "卡布尔", role: "迷宫饭 Delicious in Dungeon" },
	{ name: "尹范", role: "杀戮跟踪 Killing Stalking" },
	{ name: "里昂", role: "魔王逆谋 Dark Fall " },
	{ name: "糸师凛", role: "蓝色监狱BLUELOCK" },
    { name: "Harry Potter", role: "Harry Potter" },
	{ name: "Harry Potter", role: "Harry Potter" },
    { name: "Harry Potter", role: "Harry Potter" },
	{ name: "钟离", role: "原神 Genshin Impact" },
	{ name: "卡芙卡", role: "崩坏：星穹铁道 Honkai Starrail" },
	{ name: "里昂", role: "魔王逆谋 Dark Fall" },
	{ name: "亚历克西斯·内斯", role: "蓝色监狱BLUELOCK" },
    { name: "亚历克西斯·内斯", role: "蓝色监狱BLUELOCK" },
    { name: "御影玲王", role: "蓝色监狱BLUELOCK" },
    { name: "糸师凛", role: "蓝色监狱BLUELOCK" },
    { name: "糸师凛", role: "蓝色监狱BLUELOCK" },
    { name: "凯亚·亚尔伯里奇", role: "原神 Genshin Impact" },
    { name: "糸师冴", role: "蓝色监狱BLUELOCK" },
    { name: "尹范", role: "杀戮跟踪 Killing Stalking" },
    { name: "里昂", role: "魔王逆谋 Dark Fall" },
    { name: "里昂", role: "魔王逆谋 Dark Fall" },
    { name: "五条悟", role: "咒术回战 Jujutsu Kaisen" },
    { name: "花京院典明", role: "JOJO的奇妙冒险" },
    { name: "御影玲王", role: "蓝色监狱BLUELOCK" },
    { name: "御影玲王", role: "蓝色监狱BLUELOCK" },
    { name: "约瑟夫·德拉索恩斯", role: "第五人格 Identity V" },
    { name: "光熙", role: "电锯人 Chainsaw Man" },
    { name: "广陵王", role: "代号鸢" },
    { name: "广陵王", role: "代号鸢" },
    { name: "广陵王", role: "代号鸢" },
    { name: "玖夜", role: "新世界狂欢NU Carnival" },
    { name: "糸师冴", role: "蓝色监狱BLUELOCK" }
];

const cards = document.querySelectorAll(".card");
const dots = document.querySelectorAll(".dot");
const memberName = document.querySelector(".member-name");
const memberRole = document.querySelector(".member-role");
const leftArrow = document.querySelector(".nav-arrow.left");
const rightArrow = document.querySelector(".nav-arrow.right");
let currentIndex = 0;
let isAnimating = false;

function updateCarousel(newIndex) {
	if (isAnimating) return;
	isAnimating = true;

	currentIndex = (newIndex + cards.length) % cards.length;

	cards.forEach((card, i) => {
		const offset = (i - currentIndex + cards.length) % cards.length;

		card.classList.remove(
			"center",
			"left-1",
			"left-2",
			"right-1",
			"right-2",
			"hidden"
		);

		if (offset === 0) {
			card.classList.add("center");
		} else if (offset === 1) {
			card.classList.add("right-1");
		} else if (offset === 2) {
			card.classList.add("right-2");
		} else if (offset === cards.length - 1) {
			card.classList.add("left-1");
		} else if (offset === cards.length - 2) {
			card.classList.add("left-2");
		} else {
			card.classList.add("hidden");
		}
	});

	dots.forEach((dot, i) => {
		dot.classList.toggle("active", i === currentIndex);
	});

	memberName.style.opacity = "0";
	memberRole.style.opacity = "0";

	setTimeout(() => {
		memberName.textContent = teamMembers[currentIndex].name;
		memberRole.textContent = teamMembers[currentIndex].role;
		memberName.style.opacity = "1";
		memberRole.style.opacity = "1";
	}, 300);

	setTimeout(() => {
		isAnimating = false;
	}, 800);
}

leftArrow.addEventListener("click", () => {
	updateCarousel(currentIndex - 1);
});

rightArrow.addEventListener("click", () => {
	updateCarousel(currentIndex + 1);
});

dots.forEach((dot, i) => {
	dot.addEventListener("click", () => {
		updateCarousel(i);
	});
});

cards.forEach((card, i) => {
	card.addEventListener("click", () => {
		updateCarousel(i);
	});
});

document.addEventListener("keydown", (e) => {
	if (e.key === "ArrowLeft") {
		updateCarousel(currentIndex - 1);
	} else if (e.key === "ArrowRight") {
		updateCarousel(currentIndex + 1);
	}
});

let touchStartX = 0;
let touchEndX = 0;

document.addEventListener("touchstart", (e) => {
	touchStartX = e.changedTouches[0].screenX;
});

document.addEventListener("touchend", (e) => {
	touchEndX = e.changedTouches[0].screenX;
	handleSwipe();
});

function handleSwipe() {
	const swipeThreshold = 50;
	const diff = touchStartX - touchEndX;

	if (Math.abs(diff) > swipeThreshold) {
		if (diff > 0) {
			updateCarousel(currentIndex + 1);
		} else {
			updateCarousel(currentIndex - 1);
		}
	}
}

updateCarousel(0);

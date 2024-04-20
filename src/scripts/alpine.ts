import Alpine from "alpinejs";
import morph from "@alpinejs/morph";
import persist from "@alpinejs/persist";
import ajax from "@imacrayon/alpine-ajax";

window.Alpine = Alpine;
Alpine.plugin(morph);
Alpine.plugin(persist);
Alpine.plugin(ajax);
Alpine.start();

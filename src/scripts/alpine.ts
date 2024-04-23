import Alpine from "alpinejs";
import morph from "@alpinejs/morph";
import persist from "@alpinejs/persist";
import ajax from "@imacrayon/alpine-ajax";
import Autosize from "@marcreichel/alpine-autosize";

window.Alpine = Alpine;
Alpine.plugin(morph);
Alpine.plugin(persist);
Alpine.plugin(ajax);
Alpine.plugin(Autosize);
Alpine.start();

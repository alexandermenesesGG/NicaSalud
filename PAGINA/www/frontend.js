const filterTabs = document.querySelectorAll(".filter-tab");
const filterContents = document.querySelectorAll(".filter-content");

filterTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
        const targetId = tab.dataset.filter;

        filterTabs.forEach((item) => {
            item.classList.remove("active");
            item.setAttribute("aria-selected", "false");
        });

        filterContents.forEach((content) => {
            content.classList.toggle("active", content.id === targetId);
        });

        tab.classList.add("active");
        tab.setAttribute("aria-selected", "true");
    });
});

const searchForm = document.querySelector(".site-search");
const searchInput = document.getElementById("siteSearch");
const searchStatus = document.getElementById("searchStatus");
let currentSearchMatch = null;

function normalizarTexto(texto) {
    return texto
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

function mostrarEstadoBusqueda(mensaje) {
    if (!searchStatus) {
        return;
    }

    searchStatus.textContent = mensaje;
    searchStatus.classList.add("visible");

    window.clearTimeout(mostrarEstadoBusqueda.timeoutId);
    mostrarEstadoBusqueda.timeoutId = window.setTimeout(() => {
        searchStatus.classList.remove("visible");
    }, 3200);
}

function activarPanelSiEsNecesario(elemento) {
    const panel = elemento.closest(".filter-content");

    if (!panel || panel.classList.contains("active")) {
        return;
    }

    const tab = document.querySelector(`.filter-tab[data-filter="${panel.id}"]`);

    if (tab) {
        tab.click();
    }
}

function buscarEnSitio(consulta) {
    const termino = normalizarTexto(consulta.trim());

    if (!termino) {
        mostrarEstadoBusqueda("Escribe una palabra para buscar.");
        return;
    }

    if (currentSearchMatch) {
        currentSearchMatch.classList.remove("search-match");
        currentSearchMatch = null;
    }

    const candidatos = Array.from(document.querySelectorAll("main section, main article, .filter-card, .program, .prevention, .route-step, .stat, .contact-box"));
    const resultado = candidatos.find((elemento) => normalizarTexto(elemento.textContent).includes(termino));

    if (!resultado) {
        mostrarEstadoBusqueda(`No se encontró "${consulta}".`);
        return;
    }

    activarPanelSiEsNecesario(resultado);

    currentSearchMatch = resultado;
    currentSearchMatch.classList.add("search-match");
    currentSearchMatch.scrollIntoView({ behavior: "smooth", block: "center" });
    mostrarEstadoBusqueda(`Resultado encontrado: "${consulta}".`);
}

if (searchForm && searchInput) {
    searchForm.addEventListener("submit", (event) => {
        event.preventDefault();
        buscarEnSitio(searchInput.value);
    });
}

const diseaseSearch = document.getElementById("diseaseSearch");
const diseaseSearchStatus = document.getElementById("diseaseSearchStatus");
const diseaseSuggestions = document.getElementById("diseaseSuggestions");
const diseaseCards = document.querySelectorAll("[data-disease-card]");
const diseaseIndex = Array.from(diseaseCards)
    .map((card) => ({
        nombre: card.querySelector("strong")?.textContent.trim(),
        texto: normalizarTexto(card.textContent)
    }))
    .filter((item) => item.nombre);

function actualizarOpcionesEnfermedad(termino) {
    if (!diseaseSuggestions) {
        return;
    }

    diseaseSuggestions.replaceChildren();

    if (!termino) {
        diseaseSuggestions.classList.remove("visible");
        diseaseSearch.setAttribute("aria-expanded", "false");
        return;
    }

    const coincidencias = diseaseIndex
        .filter((item) => item.texto.includes(termino))
        .slice(0, 6);

    diseaseSuggestions.classList.toggle("visible", coincidencias.length > 0);
    diseaseSearch.setAttribute("aria-expanded", String(coincidencias.length > 0));

    coincidencias.forEach((item) => {
        const button = document.createElement("button");
        const mark = document.createElement("span");
        const copy = document.createElement("span");
        const name = document.createElement("strong");
        const hint = document.createElement("small");

        button.type = "button";
        button.className = "disease-suggestion";
        button.setAttribute("role", "option");

        mark.className = "suggestion-mark";
        mark.textContent = item.nombre.charAt(0);

        copy.className = "suggestion-copy";
        name.textContent = item.nombre;
        hint.textContent = "Ver enfermedad";

        copy.append(name, hint);
        button.append(mark, copy);

        button.addEventListener("click", () => {
            diseaseSearch.value = item.nombre;
            filtrarEnfermedades();
            diseaseSuggestions.classList.remove("visible");
            diseaseSearch.setAttribute("aria-expanded", "false");
            diseaseSearch.focus();
        });

        diseaseSuggestions.appendChild(button);
    });
}

function filtrarEnfermedades() {
    if (!diseaseSearch) {
        return;
    }

    const termino = normalizarTexto(diseaseSearch.value.trim());
    let visibles = 0;

    actualizarOpcionesEnfermedad(termino);

    diseaseCards.forEach((card) => {
        const esComun = card.dataset.common === "true";
        const coincide = normalizarTexto(card.textContent).includes(termino);
        const mostrar = termino ? coincide : esComun;
        card.classList.toggle("is-hidden", !mostrar);

        if (mostrar) {
            visibles += 1;
        }
    });

    if (diseaseSearchStatus) {
        if (!termino) {
            diseaseSearchStatus.textContent = "Mostrando enfermedades más comunes.";
        } else if (visibles === 1) {
            diseaseSearchStatus.textContent = "1 enfermedad encontrada.";
        } else if (visibles > 1) {
            diseaseSearchStatus.textContent = `${visibles} enfermedades encontradas.`;
        } else {
            diseaseSearchStatus.textContent = "No se encontraron enfermedades con esas letras.";
        }
    }
}

if (diseaseSearch && diseaseCards.length) {
    diseaseSearch.addEventListener("input", filtrarEnfermedades);
    diseaseSearch.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && diseaseSuggestions) {
            diseaseSuggestions.classList.remove("visible");
            diseaseSearch.setAttribute("aria-expanded", "false");
        }
    });

    document.addEventListener("click", (event) => {
        const target = event.target;

        if (diseaseSuggestions && target instanceof Element && !target.closest(".disease-search")) {
            diseaseSuggestions.classList.remove("visible");
            diseaseSearch.setAttribute("aria-expanded", "false");
        }
    });

    filtrarEnfermedades();
}

const plantSearch = document.getElementById("plantSearch");
const plantSearchStatus = document.getElementById("plantSearchStatus");
const plantSuggestions = document.getElementById("plantSuggestions");
const plantCards = document.querySelectorAll("[data-plant-card]");
const plantDetailPanel = document.getElementById("plantDetailPanel");
const plantDetailTitle = document.getElementById("plantDetailTitle");
const plantDetailInfo = document.getElementById("plantDetailInfo");
const plantDetailUse = document.getElementById("plantDetailUse");
const plantDetailCare = document.getElementById("plantDetailCare");
const plantDetails = {
    [normalizarTexto("Achiote")]: {
        info: "Arbusto tropical cuyas semillas se usan como colorante natural y en preparaciones caseras.",
        care: "Usarlo en cantidades moderadas como alimento. Evitar aplicarlo en heridas abiertas sin orientación."
    },
    [normalizarTexto("Ajo")]: {
        info: "Bulbo aromático muy usado en la cocina por su sabor intenso y por su tradición en cuidados respiratorios.",
        care: "Puede irritar el estómago o interactuar con anticoagulantes si se consume en exceso."
    },
    [normalizarTexto("Albahaca")]: {
        info: "Hierba aromática de hojas suaves usada en comidas, infusiones ligeras y cuidados digestivos caseros.",
        care: "Evitar preparados concentrados durante embarazo o si hay alergias a plantas aromáticas."
    },
    [normalizarTexto("Aloe vera")]: {
        info: "Planta suculenta con gel transparente en sus hojas, popular para el cuidado externo de la piel.",
        care: "Usar solo de forma externa en piel limpia. No ingerir el látex amarillo porque puede causar diarrea fuerte."
    },
    [normalizarTexto("Anís")]: {
        info: "Semilla aromática de sabor dulce, común en infusiones suaves y recetas tradicionales.",
        care: "Usar con moderación. Evitar aceites esenciales o dosis concentradas sin indicación profesional."
    },
    [normalizarTexto("Árnica")]: {
        info: "Planta de uso tradicional externo, frecuente en pomadas para golpes o molestias musculares leves.",
        care: "No ingerir. No aplicar en heridas abiertas, mucosas ni piel irritada."
    },
    [normalizarTexto("Boldo")]: {
        info: "Planta amarga usada tradicionalmente para digestión pesada y malestar después de comidas grasosas.",
        care: "Evitar en embarazo, lactancia, enfermedad hepática o cálculos biliares sin orientación médica."
    },
    [normalizarTexto("Caléndula")]: {
        info: "Flor de color amarillo o naranja usada en lavados suaves y preparados externos para piel sensible.",
        care: "No aplicar si produce ardor, ronchas o alergia. Evitar en personas alérgicas a margaritas o plantas similares."
    },
    [normalizarTexto("Canela")]: {
        info: "Corteza aromática usada en bebidas, comidas e infusiones por su sabor cálido.",
        care: "Evitar exceso, especialmente en embarazo, enfermedad hepática o uso de anticoagulantes."
    },
    [normalizarTexto("Cebolla")]: {
        info: "Bulbo alimenticio común en la cocina, usado tradicionalmente en preparaciones para tos leve.",
        care: "Puede causar acidez o gases. No usar como reemplazo de atención médica si hay fiebre o dificultad respiratoria."
    },
    [normalizarTexto("Cedrón")]: {
        info: "Planta aromática de olor cítrico, frecuente en infusiones relajantes y digestivas.",
        care: "Usar infusiones suaves. Suspender si causa somnolencia excesiva o malestar estomacal."
    },
    [normalizarTexto("Chía")]: {
        info: "Semilla rica en fibra que forma gel al hidratarse y se usa en bebidas o alimentos.",
        care: "Tomarla con suficiente agua. Introducir poco a poco si hay estreñimiento o colon sensible."
    },
    [normalizarTexto("Cilantro")]: {
        info: "Hierba culinaria de hojas frescas, usada para dar sabor y como apoyo digestivo tradicional.",
        care: "Lavar bien antes de consumir. Evitar si hay alergia o irritación digestiva."
    },
    [normalizarTexto("Clavo de olor")]: {
        info: "Botón floral seco de aroma fuerte, usado en cocina y en cuidados tradicionales de garganta o dientes.",
        care: "No colocar aceite esencial directo en encías o piel. Puede irritar y no reemplaza atención dental."
    },
    [normalizarTexto("Cola de caballo")]: {
        info: "Planta de tallos delgados usada en infusiones tradicionales por su efecto diurético suave.",
        care: "Evitar si hay enfermedad renal, embarazo, deshidratación o uso de diuréticos."
    },
    [normalizarTexto("Cúrcuma")]: {
        info: "Raíz amarilla usada como condimento y en infusiones por su tradición antiinflamatoria.",
        care: "Evitar dosis altas si hay cálculos biliares, gastritis fuerte o uso de anticoagulantes."
    },
    [normalizarTexto("Diente de león")]: {
        info: "Planta de hojas y raíz usadas en infusiones tradicionales para digestión y eliminación de líquidos.",
        care: "Consultar si hay problemas renales, biliares o uso de medicamentos diuréticos."
    },
    [normalizarTexto("Equinácea")]: {
        info: "Planta usada tradicionalmente como apoyo durante resfriados y temporadas de defensas bajas.",
        care: "Puede interactuar con medicamentos y no conviene en algunas enfermedades autoinmunes."
    },
    [normalizarTexto("Eucalipto")]: {
        info: "Árbol aromático cuyas hojas se usan en vapores para sensación de congestión nasal.",
        care: "No ingerir aceite esencial. Evitar vapores muy calientes en niños pequeños o personas con asma."
    },
    [normalizarTexto("Flor de Jamaica")]: {
        info: "Flor seca usada en refrescos e infusiones ácidas, populares para hidratar y acompañar comidas.",
        care: "Consultar si hay presión baja, embarazo o uso de medicamentos para presión arterial."
    },
    [normalizarTexto("Ginseng")]: {
        info: "Raíz usada tradicionalmente para cansancio, energía y rendimiento físico o mental.",
        care: "Evitar si hay presión alta no controlada, insomnio, embarazo o uso de anticoagulantes."
    },
    [normalizarTexto("Guayaba")]: {
        info: "Árbol frutal cuyas hojas se usan en infusiones tradicionales y cuyo fruto aporta vitamina C.",
        care: "No reemplaza suero oral ni atención si hay diarrea con sangre, fiebre o deshidratación."
    },
    [normalizarTexto("Hierbabuena")]: {
        info: "Hierba aromática fresca, parecida a la menta, usada en bebidas e infusiones digestivas.",
        care: "Puede empeorar reflujo en algunas personas. Usar infusiones suaves."
    },
    [normalizarTexto("Hinojo")]: {
        info: "Semilla aromática usada en infusiones tradicionales para gases y cólicos leves.",
        care: "Evitar preparados concentrados en embarazo, lactancia o niños pequeños sin orientación."
    },
    [normalizarTexto("Jengibre")]: {
        info: "Raíz picante usada en comidas, bebidas e infusiones durante resfriados o náuseas leves.",
        care: "Puede causar acidez. Consultar si se usan anticoagulantes o hay cálculos biliares."
    },
    [normalizarTexto("Laurel")]: {
        info: "Hoja aromática usada para dar sabor a comidas y en infusiones digestivas tradicionales.",
        care: "Retirar la hoja de las comidas antes de servir. Evitar aceites concentrados."
    },
    [normalizarTexto("Linaza")]: {
        info: "Semilla rica en fibra y mucílagos, usada para apoyar tránsito intestinal y saciedad.",
        care: "Tomarla con agua suficiente. Separarla de medicamentos porque puede disminuir su absorción."
    },
    [normalizarTexto("Llantén")]: {
        info: "Planta de hojas anchas usada en tradición popular para garganta, tos leve y lavados externos.",
        care: "Lavar muy bien las hojas. No aplicar en heridas profundas ni usar si hay alergia."
    },
    [normalizarTexto("Malva")]: {
        info: "Planta suave con mucílagos, usada en infusiones para garganta irritada y molestias digestivas leves.",
        care: "Separar de medicamentos por al menos dos horas, porque sus mucílagos pueden afectar absorción."
    },
    [normalizarTexto("Manzanilla")]: {
        info: "Flor aromática usada en infusiones suaves para descanso, nervios leves y digestión.",
        care: "Evitar si hay alergia a margaritas o plantas similares. No usar en ojos sin indicación."
    },
    [normalizarTexto("Menta")]: {
        info: "Hierba fresca de aroma intenso usada en bebidas, comidas e infusiones digestivas.",
        care: "Puede empeorar reflujo. Evitar aceites esenciales por vía oral."
    },
    [normalizarTexto("Moringa")]: {
        info: "Árbol de hojas nutritivas usadas como alimento por su aporte de vitaminas y minerales.",
        care: "Usarla como complemento alimenticio, no como cura. Consultar en embarazo o tratamientos crónicos."
    },
    [normalizarTexto("Naranja agria")]: {
        info: "Cítrico usado en comidas, bebidas y preparaciones tradicionales por su sabor ácido.",
        care: "Puede irritar gastritis o reflujo. Consultar si se toman medicamentos sensibles a cítricos."
    },
    [normalizarTexto("Noni")]: {
        info: "Fruto tropical usado tradicionalmente en jugos o preparados para bienestar general.",
        care: "Consultar si hay enfermedad renal, hepática o uso de medicamentos. Evitar exceso."
    },
    [normalizarTexto("Orégano")]: {
        info: "Hierba aromática muy usada en cocina y en infusiones tradicionales para tos o digestión.",
        care: "Evitar aceite esencial por vía oral. Usar cantidades culinarias o infusiones suaves."
    },
    [normalizarTexto("Ortiga")]: {
        info: "Planta de hojas urticantes usada tradicionalmente en infusiones y preparaciones para articulaciones.",
        care: "Manipular con cuidado. Consultar si hay embarazo, presión baja o uso de diuréticos."
    },
    [normalizarTexto("Pasiflora")]: {
        info: "Planta trepadora usada en infusiones para relajación, nervios leves y sueño.",
        care: "Puede causar somnolencia. Evitar mezclar con alcohol, sedantes o manejar después de tomarla."
    },
    [normalizarTexto("Perejil")]: {
        info: "Hierba culinaria fresca usada para sabor y como apoyo diurético tradicional.",
        care: "Evitar preparados concentrados en embarazo o enfermedad renal."
    },
    [normalizarTexto("Romero")]: {
        info: "Arbusto aromático usado en cocina, infusiones y fricciones externas tradicionales.",
        care: "Evitar aceite esencial por vía oral. Consultar si hay epilepsia, embarazo o presión alta."
    },
    [normalizarTexto("Ruda")]: {
        info: "Planta de olor fuerte usada en tradición popular para cólicos y rituales.",
        care: "No usar en embarazo. Puede ser tóxica en dosis altas y causar irritación."
    },
    [normalizarTexto("Salvia")]: {
        info: "Planta aromática usada en infusiones y gárgaras tradicionales para garganta y digestión.",
        care: "Evitar uso prolongado o concentrado. Consultar en embarazo, lactancia o epilepsia."
    },
    [normalizarTexto("Sábila")]: {
        info: "Nombre común del aloe vera, planta de hojas carnosas con gel usado en piel.",
        care: "Usar el gel limpio de forma externa. No ingerir el látex amarillo."
    },
    [normalizarTexto("Sauco")]: {
        info: "Planta de flores pequeñas usada en infusiones tradicionales durante resfriados leves.",
        care: "No consumir partes crudas o verdes. Consultar si hay embarazo o enfermedad autoinmune."
    },
    [normalizarTexto("Té verde")]: {
        info: "Infusión de hojas de Camellia sinensis, apreciada por su sabor y contenido de cafeína.",
        care: "Puede causar insomnio o acidez. Moderar si hay ansiedad, presión alta o embarazo."
    },
    [normalizarTexto("Tilo")]: {
        info: "Flor usada en infusiones tradicionales para relajación, descanso y nervios leves.",
        care: "Puede causar sueño. Evitar mezclar con sedantes o alcohol."
    },
    [normalizarTexto("Tomillo")]: {
        info: "Hierba aromática usada en cocina e infusiones tradicionales para garganta y digestión.",
        care: "Evitar aceites esenciales por vía oral. Consultar en embarazo o alergias."
    },
    [normalizarTexto("Toronjil")]: {
        info: "Planta aromática de olor cítrico, también conocida como melisa, usada para calma y digestión.",
        care: "Puede causar somnolencia. Consultar si se toman medicamentos sedantes o tiroideos."
    },
    [normalizarTexto("Valeriana")]: {
        info: "Raíz usada tradicionalmente para sueño, relajación y nervios leves.",
        care: "Puede causar somnolencia. No mezclar con alcohol, sedantes ni manejar después."
    },
    [normalizarTexto("Zacate limón")]: {
        info: "Hierba de aroma cítrico usada en infusiones refrescantes y relajantes.",
        care: "Usar infusiones suaves. Consultar en embarazo o si causa acidez."
    },
    [normalizarTexto("Zarzaparrilla")]: {
        info: "Planta trepadora cuya raíz se usa tradicionalmente en bebidas y preparados de bienestar.",
        care: "Consultar si hay enfermedad renal, embarazo o uso de medicamentos."
    }
};
const plantIndex = Array.from(plantCards)
    .map((card) => {
        const nombre = card.querySelector("strong")?.textContent.trim();
        const uso = card.dataset.use || "";
        const detalle = plantDetails[normalizarTexto(nombre || "")] || {};

        return {
            card,
            nombre,
            uso,
            info: detalle.info || "Planta de uso tradicional en cuidados caseros y alimentación.",
            care: detalle.care || "Usar con moderación y consultar con personal de salud ante dudas o síntomas persistentes.",
            nombreTexto: normalizarTexto(nombre || ""),
            usoTexto: normalizarTexto(uso)
        };
    })
    .filter((item) => item.nombre);

function mostrarDetallePlanta(item) {
    if (!plantDetailPanel || !plantDetailTitle || !plantDetailInfo || !plantDetailUse || !plantDetailCare) {
        return;
    }

    plantDetailTitle.textContent = item.nombre;
    plantDetailInfo.textContent = item.info;
    plantDetailUse.textContent = item.uso;
    plantDetailCare.textContent = item.care;
    plantDetailPanel.classList.add("visible");

    plantIndex.forEach((plant) => {
        const activo = plant === item;
        plant.card.classList.toggle("active", activo);
        plant.card.setAttribute("aria-pressed", String(activo));
    });

    plantDetailPanel.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function coincidePlanta(item, termino) {
    if (!termino) {
        return true;
    }

    if (termino.length < 3) {
        return item.nombreTexto.includes(termino);
    }

    return item.nombreTexto.includes(termino) || item.usoTexto.includes(termino);
}

function obtenerCoincidenciasPlanta(termino) {
    return plantIndex
        .filter((item) => coincidePlanta(item, termino))
        .sort((a, b) => {
            const aEmpieza = a.nombreTexto.startsWith(termino);
            const bEmpieza = b.nombreTexto.startsWith(termino);

            if (aEmpieza !== bEmpieza) {
                return aEmpieza ? -1 : 1;
            }

            return a.nombre.localeCompare(b.nombre, "es");
        });
}

function autocompletarPlanta(event) {
    if (!plantSearch || event.inputType?.startsWith("delete")) {
        return;
    }

    const textoEscrito = plantSearch.value;
    const termino = normalizarTexto(textoEscrito.trim());

    if (!termino) {
        return;
    }

    const sugerencia = obtenerCoincidenciasPlanta(termino)
        .find((item) => item.nombreTexto.startsWith(termino));

    if (!sugerencia || sugerencia.nombreTexto === termino) {
        return;
    }

    const inicioSeleccion = textoEscrito.length;

    plantSearch.value = sugerencia.nombre;
    plantSearch.setSelectionRange(inicioSeleccion, sugerencia.nombre.length);
}

function actualizarOpcionesPlanta(termino) {
    if (!plantSuggestions || !plantSearch) {
        return;
    }

    plantSuggestions.replaceChildren();

    if (!termino) {
        plantSuggestions.classList.remove("visible");
        plantSearch.setAttribute("aria-expanded", "false");
        return;
    }

    const coincidencias = obtenerCoincidenciasPlanta(termino).slice(0, 8);

    plantSuggestions.classList.toggle("visible", coincidencias.length > 0);
    plantSearch.setAttribute("aria-expanded", String(coincidencias.length > 0));

    coincidencias.forEach((item) => {
        const button = document.createElement("button");
        const mark = document.createElement("span");
        const copy = document.createElement("span");
        const name = document.createElement("strong");
        const hint = document.createElement("small");

        button.type = "button";
        button.className = "disease-suggestion";
        button.setAttribute("role", "option");

        mark.className = "suggestion-mark";
        mark.textContent = item.nombre.charAt(0);

        copy.className = "suggestion-copy";
        name.textContent = item.nombre;
        hint.textContent = item.uso;

        copy.append(name, hint);
        button.append(mark, copy);

        button.addEventListener("click", () => {
            plantSearch.value = item.nombre;
            filtrarPlantas();
            mostrarDetallePlanta(item);
            plantSuggestions.classList.remove("visible");
            plantSearch.setAttribute("aria-expanded", "false");
            plantSearch.focus();
        });

        plantSuggestions.appendChild(button);
    });
}

function filtrarPlantas() {
    if (!plantSearch) {
        return;
    }

    const termino = normalizarTexto(plantSearch.value.trim());
    let visibles = 0;

    actualizarOpcionesPlanta(termino);

    visibles = termino
        ? plantIndex.filter((item) => coincidePlanta(item, termino)).length
        : plantIndex.length;

    if (plantSearchStatus) {
        if (!termino) {
            plantSearchStatus.textContent = `Busca por nombre o uso entre ${visibles} plantas medicinales.`;
        } else if (visibles === 1) {
            plantSearchStatus.textContent = "1 planta relacionada encontrada.";
        } else if (visibles > 1) {
            plantSearchStatus.textContent = `${visibles} plantas relacionadas encontradas.`;
        } else {
            plantSearchStatus.textContent = "No se encontraron plantas con esas letras.";
        }
    }
}

if (plantSearch && plantCards.length) {
    plantIndex.forEach((item) => {
        item.card.setAttribute("role", "button");
        item.card.setAttribute("tabindex", "0");
        item.card.setAttribute("aria-controls", "plantDetailPanel");
        item.card.setAttribute("aria-pressed", "false");

        item.card.addEventListener("click", () => {
            mostrarDetallePlanta(item);
        });

        item.card.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                mostrarDetallePlanta(item);
            }
        });
    });

    plantSearch.addEventListener("input", (event) => {
        autocompletarPlanta(event);
        filtrarPlantas();
    });
    plantSearch.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            const termino = normalizarTexto(plantSearch.value.trim());
            const plantaSeleccionada = plantIndex.find((item) => item.nombreTexto === termino);

            if (plantaSeleccionada) {
                event.preventDefault();
                mostrarDetallePlanta(plantaSeleccionada);

                if (plantSuggestions) {
                    plantSuggestions.classList.remove("visible");
                    plantSearch.setAttribute("aria-expanded", "false");
                }
            }
        }

        if (event.key === "Escape" && plantSuggestions) {
            plantSuggestions.classList.remove("visible");
            plantSearch.setAttribute("aria-expanded", "false");
        }
    });

    document.addEventListener("click", (event) => {
        const target = event.target;

        if (plantSuggestions && target instanceof Element && !target.closest(".plant-search")) {
            plantSuggestions.classList.remove("visible");
            plantSearch.setAttribute("aria-expanded", "false");
        }
    });

    filtrarPlantas();
}

const healthSurvey = document.getElementById("healthSurvey");
const surveyResult = document.getElementById("surveyResult");

if (healthSurvey && surveyResult) {
    healthSurvey.addEventListener("submit", (event) => {
        event.preventDefault();

        const data = new FormData(healthSurvey);
        const estado = Number(data.get("estado"));
        const sintomas = Number(data.get("sintomas"));
        const habitos = Number(data.get("habitos"));
        const prevencion = Number(data.get("prevencion"));
        const total = estado + sintomas + habitos + prevencion;
        const consejos = [];
        let titulo = "";
        let mensaje = "";

        if (sintomas >= 4 || total >= 8) {
            titulo = "Prioridad alta";
            mensaje = "Tus respuestas indican señales que conviene atender pronto. Busca orientación en una unidad de salud, especialmente si los síntomas son fuertes o persistentes.";
        } else if (total >= 5) {
            titulo = "Cuidado preventivo recomendado";
            mensaje = "Hay algunos puntos que puedes mejorar desde hoy. Observa tus síntomas y refuerza hábitos de prevención durante los próximos días.";
        } else if (total >= 2) {
            titulo = "Vas bien, con pequeños ajustes";
            mensaje = "Tus respuestas muestran un estado general estable, pero hay detalles que puedes fortalecer para prevenir riesgos.";
        } else {
            titulo = "Buen cuidado general";
            mensaje = "Tus respuestas reflejan buenos hábitos de salud. Mantén la higiene, la hidratación, la alimentación variada y la prevención en casa.";
        }

        if (sintomas >= 2) {
            consejos.push("Vigila fiebre, dolor fuerte, tos persistente o dificultad para respirar.");
        }

        if (habitos >= 1) {
            consejos.push("Mejora el consumo de agua y procura comidas más variadas.");
        }

        if (prevencion >= 1) {
            consejos.push("Refuerza lavado de manos, agua segura y eliminación de criaderos.");
        }

        const detalle = consejos.length
            ? `<ul>${consejos.map((consejo) => `<li>${consejo}</li>`).join("")}</ul>`
            : "";

        surveyResult.innerHTML = `
            <strong>${titulo}</strong>
            <p>${mensaje}</p>
            ${detalle}
        `;
        surveyResult.classList.add("visible");
        surveyResult.scrollIntoView({ behavior: "smooth", block: "center" });
    });
}

const imcForm = document.getElementById("imcForm");
const imcResult = document.getElementById("imcResult");

if (imcForm && imcResult) {
    imcForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const data = new FormData(imcForm);
        const edad = Number(data.get("edad"));
        const genero = data.get("genero");
        const peso = Number(data.get("peso"));
        const unidadPeso = data.get("unidadPeso");
        const pesoKg = unidadPeso === "lbs" ? peso * 0.45359237 : peso;
        const alturaCm = Number(data.get("altura"));
        const alturaM = alturaCm / 100;
        const imc = pesoKg / (alturaM * alturaM);
        let categoria = "";
        let mensaje = "";

        if (!edad || !genero || !peso || !unidadPeso || !alturaCm || alturaM <= 0) {
            imcResult.innerHTML = `
                <strong>Revisa los datos</strong>
                <p>Completa edad, género, peso y altura para calcular el IMC.</p>
            `;
            imcResult.classList.add("visible");
            return;
        }

        if (edad < 18) {
            categoria = "Resultado orientativo";
            mensaje = "En menores de 18 años el IMC se interpreta con tablas de crecimiento según edad y sexo. Comparte este resultado con personal de salud para una orientación adecuada.";
        } else if (imc < 18.5) {
            categoria = "Bajo peso";
            mensaje = "Tu IMC está por debajo del rango de referencia para personas adultas. Procura una alimentación suficiente y consulta si hay pérdida de peso, cansancio o falta de apetito.";
        } else if (imc < 25) {
            categoria = "Rango saludable";
            mensaje = "Tu IMC está dentro del rango de referencia para personas adultas. Mantén hábitos de alimentación variada, hidratación y actividad física.";
        } else if (imc < 30) {
            categoria = "Sobrepeso";
            mensaje = "Tu IMC está por encima del rango saludable. Puede ayudar revisar porciones, actividad física y consumo de agua; busca orientación si tienes presión alta, diabetes u otros riesgos.";
        } else {
            categoria = "Obesidad";
            mensaje = "Tu IMC indica obesidad en rangos adultos. Es recomendable recibir orientación profesional para cuidar tu salud de forma segura y progresiva.";
        }

        imcResult.innerHTML = `
            <strong>${categoria}</strong>
            <p>IMC: ${imc.toFixed(1)} | Peso: ${peso} ${unidadPeso} | Edad: ${edad} | Género: ${genero}</p>
            <p>${mensaje}</p>
        `;
        imcResult.classList.add("visible");
        imcResult.scrollIntoView({ behavior: "smooth", block: "center" });
    });
}

// Codigos con las coordenadas exactas del mapa de Nicaragua GG
const departmentTitle = document.getElementById("departmentTitle");
const departmentDescription = document.getElementById("departmentDescription");
const departmentHospitals = document.getElementById("departmentHospitals");
const mapaNicaraguaElement = document.getElementById("mapaNicaragua");

if (mapaNicaraguaElement) {
const hospitales = [


    {
        nombre: "Hospital Alfonso Moncada Guillén",
        lugar: "Ocotal, Nueva Segovia",
        departamento: "Nueva Segovia",
        lat: 13.6321,
        lon: -86.4752,
        tipo: "regional"
    },
    {
        nombre: "Hospital Juan Antonio Brenes",
        lugar: "Somoto, Madriz",
        departamento: "Madriz",
        lat: 13.4808,
        lon: -86.5821,
        tipo: "normal"
    },
    {
        nombre: "Hospital San Juan de Dios",
        lugar: "Estelí",
        departamento: "Estelí",
        lat: 13.0919,
        lon: -86.3538,
        tipo: "regional"
    },
    {
        nombre: "Hospital Victoria Motta",
        lugar: "Jinotega",
        departamento: "Jinotega",
        lat: 13.0917,
        lon: -85.9994,
        tipo: "regional"
    },
    {
        nombre: "Hospital Escuela César Amador Molina",
        lugar: "Matagalpa",
        departamento: "Matagalpa",
        lat: 12.9256,
        lon: -85.9175,
        tipo: "regional"
    },
    {
        nombre: "Hospital Primario Carlos Centeno",
        lugar: "Siuna",
        departamento: "Costa Caribe Norte",
        lat: 13.7332,
        lon: -84.7773,
        tipo: "normal"
    },
    {
        nombre: "Hospital Nuevo Amanecer",
        lugar: "Bilwi",
        departamento: "Costa Caribe Norte",
        lat: 14.0351,
        lon: -83.3852,
        tipo: "normal"
    },
    {
        nombre: "Hospital España",
        lugar: "Chinandega",
        departamento: "Chinandega",
        lat: 12.6294,
        lon: -87.1311,
        tipo: "regional"
    },
    {
        nombre: "Hospital Escuela Oscar Danilo Rosales",
        lugar: "León",
        departamento: "León",
        lat: 12.4379,
        lon: -86.8780,
        tipo: "regional"
    },
    {
        nombre: "Hospital Antonio Lenín Fonseca",
        lugar: "Managua",
        departamento: "Managua",
        lat: 12.1440,
        lon: -86.2893,
        tipo: "nacional"
    },
    {
        nombre: "Hospital Bertha Calderón Roque",
        lugar: "Managua",
        departamento: "Managua",
        lat: 12.1307,
        lon: -86.2747,
        tipo: "nacional"
    },
    {
        nombre: "Hospital Infantil Manuel de Jesús Rivera La Mascota",
        lugar: "Managua",
        departamento: "Managua",
        lat: 12.1257,
        lon: -86.2557,
        tipo: "nacional"
    },
    {
        nombre: "Hospital Alemán Nicaragüense",
        lugar: "Managua",
        departamento: "Managua",
        lat: 12.1515,
        lon: -86.2313,
        tipo: "nacional"
    },
    {
        nombre: "Hospital Manolo Morales Peralta",
        lugar: "Managua",
        departamento: "Managua",
        lat: 12.1260,
        lon: -86.2580,
        tipo: "nacional"
    },
    {
        nombre: "Hospital Occidental Fernando Vélez Paiz",
        lugar: "Managua",
        departamento: "Managua",
        lat: 12.1183,
        lon: -86.2992,
        tipo: "nacional"
    },
    {
        nombre: "Hospital José Nieborowski",
        lugar: "Boaco",
        departamento: "Boaco",
        lat: 12.4690,
        lon: -85.6586,
        tipo: "normal"
    },
    {
        nombre: "Hospital Humberto Alvarado Vásquez",
        lugar: "Masaya",
        departamento: "Masaya",
        lat: 11.9744,
        lon: -86.0942,
        tipo: "regional"
    },
    {
        nombre: "Hospital Amistad Japón-Nicaragua",
        lugar: "Granada",
        departamento: "Granada",
        lat: 11.9299,
        lon: -85.9560,
        tipo: "normal"
    },
    {
        nombre: "Hospital Regional Santiago",
        lugar: "Jinotepe",
        departamento: "Carazo",
        lat: 11.8496,
        lon: -86.1990,
        tipo: "normal"
    },
    {
        nombre: "Hospital Gaspar García Laviana",
        lugar: "Rivas",
        departamento: "Rivas",
        lat: 11.4372,
        lon: -85.8263,
        tipo: "regional"
    },
    {
        nombre: "Hospital Escuela Asunción",
        lugar: "Juigalpa",
        departamento: "Chontales",
        lat: 12.1063,
        lon: -85.3647,
        tipo: "regional"
    },
    {
        nombre: "Hospital Jacinto Hernández",
        lugar: "Nueva Guinea",
        departamento: "Costa Caribe Sur",
        lat: 11.6876,
        lon: -84.4559,
        tipo: "normal"
    },
    {
        nombre: "Hospital Regional Ernesto Sequeira Blanco",
        lugar: "Bluefields",
        departamento: "Costa Caribe Sur",
        lat: 12.0137,
        lon: -83.7635,
        tipo: "regional"
    },
    {
        nombre: "Hospital Luis Felipe Moncada",
        lugar: "San Carlos",
        departamento: "Río San Juan",
        lat: 11.1236,
        lon: -84.7779,
        tipo: "normal"
    }
];

if (window.L) {
    const mapaNicaragua = L.map("mapaNicaragua", {
        zoomControl: true,
        scrollWheelZoom: false
    }).setView([12.8654, -85.2072], 7.2);

    L.tileLayer("https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}", {
        maxZoom: 20,
        subdomains: ["mt0", "mt1", "mt2", "mt3"],
        attribution: "Map data by Google"
    }).addTo(mapaNicaragua);

    function obtenerColorHospital(tipo) {
        if (tipo === "nacional") {
            return "#ffd166";
        }

        if (tipo === "regional") {
            return "#7bf1c8";
        }

        return "#ff6f61";
    }

    function mostrarHospital(hospital) {
        departmentTitle.textContent = hospital.departamento;
        departmentDescription.textContent = `${hospital.nombre} - ${hospital.lugar}`;
        departmentHospitals.innerHTML = `
            <li>Tipo: ${hospital.tipo}</li>
            <li>Latitud: ${hospital.lat}</li>
            <li>Longitud: ${hospital.lon}</li>
        `;
    }

    const hospitalesLayer = L.layerGroup().addTo(mapaNicaragua);

    hospitales.forEach((hospital) => {
        const marcador = L.circleMarker([hospital.lat, hospital.lon], {
            radius: hospital.tipo === "nacional" ? 9 : 7,
            color: "#ffffff",
            weight: 2,
            fillColor: obtenerColorHospital(hospital.tipo),
            fillOpacity: 0.95
        }).addTo(hospitalesLayer);

        marcador.bindPopup(`
            <strong>${hospital.nombre}</strong><br>
            ${hospital.lugar}<br>
            ${hospital.departamento}
        `);

        marcador.on("click", () => {
            mostrarHospital(hospital);
        });

        marcador.on("mouseover", () => {
            mostrarHospital(hospital);
        });
    });

    if (hospitales.length) {
        mostrarHospital(hospitales[0]);
    }
} else {
    mapaNicaraguaElement.innerHTML = "<div class=\"p-6 text-slate-700\">Activa internet para cargar Google Maps con Leaflet.</div>";
}
}
const contactForm = document.getElementById("contactForm");
const contactStatus = document.getElementById("contactStatus");

if (contactForm) {
    contactForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const submitButton = contactForm.querySelector('button[type="submit"]');
        const originalText = submitButton?.textContent || "Enviar mensaje";
        const endpoint = contactForm.getAttribute("action") || "api/contacto.php";

        if (contactStatus) {
            contactStatus.textContent = "Enviando mensaje...";
            contactStatus.className = "contact-status";
        }

        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = "Enviando...";
        }

        try {
            const response = await fetch(endpoint, {
                method: "POST",
                body: new FormData(contactForm),
                headers: {
                    Accept: "application/json"
                }
            });

            const payload = await response.json().catch(() => null);

            if (!response.ok || !payload?.success) {
                throw new Error(payload?.message || "No se pudo guardar tu mensaje.");
            }

            contactForm.reset();

            if (contactStatus) {
                contactStatus.textContent = payload.message || "Mensaje enviado y guardado correctamente.";
                contactStatus.className = "contact-status success";
            }
        } catch (error) {
            if (contactStatus) {
                contactStatus.textContent = error instanceof Error ? error.message : "Hubo un problema al enviar el mensaje.";
                contactStatus.className = "contact-status error";
            }
        } finally {
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = originalText;
            }
        }
    });
}



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
        mostrarEstadoBusqueda(`No se encontrÃ³ "${consulta}".`);
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
            diseaseSearchStatus.textContent = "Mostrando enfermedades mÃ¡s comunes.";
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
        care: "Usarlo en cantidades moderadas como alimento. Evitar aplicarlo en heridas abiertas sin orientaciÃ³n."
    },
    [normalizarTexto("Ajo")]: {
        info: "Bulbo aromÃ¡tico muy usado en la cocina por su sabor intenso y por su tradiciÃ³n en cuidados respiratorios.",
        care: "Puede irritar el estÃ³mago o interactuar con anticoagulantes si se consume en exceso."
    },
    [normalizarTexto("Albahaca")]: {
        info: "Hierba aromÃ¡tica de hojas suaves usada en comidas, infusiones ligeras y cuidados digestivos caseros.",
        care: "Evitar preparados concentrados durante embarazo o si hay alergias a plantas aromÃ¡ticas."
    },
    [normalizarTexto("Aloe vera")]: {
        info: "Planta suculenta con gel transparente en sus hojas, popular para el cuidado externo de la piel.",
        care: "Usar solo de forma externa en piel limpia. No ingerir el lÃ¡tex amarillo porque puede causar diarrea fuerte."
    },
    [normalizarTexto("AnÃ­s")]: {
        info: "Semilla aromÃ¡tica de sabor dulce, comÃºn en infusiones suaves y recetas tradicionales.",
        care: "Usar con moderaciÃ³n. Evitar aceites esenciales o dosis concentradas sin indicaciÃ³n profesional."
    },
    [normalizarTexto("Ãrnica")]: {
        info: "Planta de uso tradicional externo, frecuente en pomadas para golpes o molestias musculares leves.",
        care: "No ingerir. No aplicar en heridas abiertas, mucosas ni piel irritada."
    },
    [normalizarTexto("Boldo")]: {
        info: "Planta amarga usada tradicionalmente para digestiÃ³n pesada y malestar despuÃ©s de comidas grasosas.",
        care: "Evitar en embarazo, lactancia, enfermedad hepÃ¡tica o cÃ¡lculos biliares sin orientaciÃ³n mÃ©dica."
    },
    [normalizarTexto("CalÃ©ndula")]: {
        info: "Flor de color amarillo o naranja usada en lavados suaves y preparados externos para piel sensible.",
        care: "No aplicar si produce ardor, ronchas o alergia. Evitar en personas alÃ©rgicas a margaritas o plantas similares."
    },
    [normalizarTexto("Canela")]: {
        info: "Corteza aromÃ¡tica usada en bebidas, comidas e infusiones por su sabor cÃ¡lido.",
        care: "Evitar exceso, especialmente en embarazo, enfermedad hepÃ¡tica o uso de anticoagulantes."
    },
    [normalizarTexto("Cebolla")]: {
        info: "Bulbo alimenticio comÃºn en la cocina, usado tradicionalmente en preparaciones para tos leve.",
        care: "Puede causar acidez o gases. No usar como reemplazo de atenciÃ³n mÃ©dica si hay fiebre o dificultad respiratoria."
    },
    [normalizarTexto("CedrÃ³n")]: {
        info: "Planta aromÃ¡tica de olor cÃ­trico, frecuente en infusiones relajantes y digestivas.",
        care: "Usar infusiones suaves. Suspender si causa somnolencia excesiva o malestar estomacal."
    },
    [normalizarTexto("ChÃ­a")]: {
        info: "Semilla rica en fibra que forma gel al hidratarse y se usa en bebidas o alimentos.",
        care: "Tomarla con suficiente agua. Introducir poco a poco si hay estreÃ±imiento o colon sensible."
    },
    [normalizarTexto("Cilantro")]: {
        info: "Hierba culinaria de hojas frescas, usada para dar sabor y como apoyo digestivo tradicional.",
        care: "Lavar bien antes de consumir. Evitar si hay alergia o irritaciÃ³n digestiva."
    },
    [normalizarTexto("Clavo de olor")]: {
        info: "BotÃ³n floral seco de aroma fuerte, usado en cocina y en cuidados tradicionales de garganta o dientes.",
        care: "No colocar aceite esencial directo en encÃ­as o piel. Puede irritar y no reemplaza atenciÃ³n dental."
    },
    [normalizarTexto("Cola de caballo")]: {
        info: "Planta de tallos delgados usada en infusiones tradicionales por su efecto diurÃ©tico suave.",
        care: "Evitar si hay enfermedad renal, embarazo, deshidrataciÃ³n o uso de diurÃ©ticos."
    },
    [normalizarTexto("CÃºrcuma")]: {
        info: "RaÃ­z amarilla usada como condimento y en infusiones por su tradiciÃ³n antiinflamatoria.",
        care: "Evitar dosis altas si hay cÃ¡lculos biliares, gastritis fuerte o uso de anticoagulantes."
    },
    [normalizarTexto("Diente de leÃ³n")]: {
        info: "Planta de hojas y raÃ­z usadas en infusiones tradicionales para digestiÃ³n y eliminaciÃ³n de lÃ­quidos.",
        care: "Consultar si hay problemas renales, biliares o uso de medicamentos diurÃ©ticos."
    },
    [normalizarTexto("EquinÃ¡cea")]: {
        info: "Planta usada tradicionalmente como apoyo durante resfriados y temporadas de defensas bajas.",
        care: "Puede interactuar con medicamentos y no conviene en algunas enfermedades autoinmunes."
    },
    [normalizarTexto("Eucalipto")]: {
        info: "Ãrbol aromÃ¡tico cuyas hojas se usan en vapores para sensaciÃ³n de congestiÃ³n nasal.",
        care: "No ingerir aceite esencial. Evitar vapores muy calientes en niÃ±os pequeÃ±os o personas con asma."
    },
    [normalizarTexto("Flor de Jamaica")]: {
        info: "Flor seca usada en refrescos e infusiones Ã¡cidas, populares para hidratar y acompaÃ±ar comidas.",
        care: "Consultar si hay presiÃ³n baja, embarazo o uso de medicamentos para presiÃ³n arterial."
    },
    [normalizarTexto("Ginseng")]: {
        info: "RaÃ­z usada tradicionalmente para cansancio, energÃ­a y rendimiento fÃ­sico o mental.",
        care: "Evitar si hay presiÃ³n alta no controlada, insomnio, embarazo o uso de anticoagulantes."
    },
    [normalizarTexto("Guayaba")]: {
        info: "Ãrbol frutal cuyas hojas se usan en infusiones tradicionales y cuyo fruto aporta vitamina C.",
        care: "No reemplaza suero oral ni atenciÃ³n si hay diarrea con sangre, fiebre o deshidrataciÃ³n."
    },
    [normalizarTexto("Hierbabuena")]: {
        info: "Hierba aromÃ¡tica fresca, parecida a la menta, usada en bebidas e infusiones digestivas.",
        care: "Puede empeorar reflujo en algunas personas. Usar infusiones suaves."
    },
    [normalizarTexto("Hinojo")]: {
        info: "Semilla aromÃ¡tica usada en infusiones tradicionales para gases y cÃ³licos leves.",
        care: "Evitar preparados concentrados en embarazo, lactancia o niÃ±os pequeÃ±os sin orientaciÃ³n."
    },
    [normalizarTexto("Jengibre")]: {
        info: "RaÃ­z picante usada en comidas, bebidas e infusiones durante resfriados o nÃ¡useas leves.",
        care: "Puede causar acidez. Consultar si se usan anticoagulantes o hay cÃ¡lculos biliares."
    },
    [normalizarTexto("Laurel")]: {
        info: "Hoja aromÃ¡tica usada para dar sabor a comidas y en infusiones digestivas tradicionales.",
        care: "Retirar la hoja de las comidas antes de servir. Evitar aceites concentrados."
    },
    [normalizarTexto("Linaza")]: {
        info: "Semilla rica en fibra y mucÃ­lagos, usada para apoyar trÃ¡nsito intestinal y saciedad.",
        care: "Tomarla con agua suficiente. Separarla de medicamentos porque puede disminuir su absorciÃ³n."
    },
    [normalizarTexto("LlantÃ©n")]: {
        info: "Planta de hojas anchas usada en tradiciÃ³n popular para garganta, tos leve y lavados externos.",
        care: "Lavar muy bien las hojas. No aplicar en heridas profundas ni usar si hay alergia."
    },
    [normalizarTexto("Malva")]: {
        info: "Planta suave con mucÃ­lagos, usada en infusiones para garganta irritada y molestias digestivas leves.",
        care: "Separar de medicamentos por al menos dos horas, porque sus mucÃ­lagos pueden afectar absorciÃ³n."
    },
    [normalizarTexto("Manzanilla")]: {
        info: "Flor aromÃ¡tica usada en infusiones suaves para descanso, nervios leves y digestiÃ³n.",
        care: "Evitar si hay alergia a margaritas o plantas similares. No usar en ojos sin indicaciÃ³n."
    },
    [normalizarTexto("Menta")]: {
        info: "Hierba fresca de aroma intenso usada en bebidas, comidas e infusiones digestivas.",
        care: "Puede empeorar reflujo. Evitar aceites esenciales por vÃ­a oral."
    },
    [normalizarTexto("Moringa")]: {
        info: "Ãrbol de hojas nutritivas usadas como alimento por su aporte de vitaminas y minerales.",
        care: "Usarla como complemento alimenticio, no como cura. Consultar en embarazo o tratamientos crÃ³nicos."
    },
    [normalizarTexto("Naranja agria")]: {
        info: "CÃ­trico usado en comidas, bebidas y preparaciones tradicionales por su sabor Ã¡cido.",
        care: "Puede irritar gastritis o reflujo. Consultar si se toman medicamentos sensibles a cÃ­tricos."
    },
    [normalizarTexto("Noni")]: {
        info: "Fruto tropical usado tradicionalmente en jugos o preparados para bienestar general.",
        care: "Consultar si hay enfermedad renal, hepÃ¡tica o uso de medicamentos. Evitar exceso."
    },
    [normalizarTexto("OrÃ©gano")]: {
        info: "Hierba aromÃ¡tica muy usada en cocina y en infusiones tradicionales para tos o digestiÃ³n.",
        care: "Evitar aceite esencial por vÃ­a oral. Usar cantidades culinarias o infusiones suaves."
    },
    [normalizarTexto("Ortiga")]: {
        info: "Planta de hojas urticantes usada tradicionalmente en infusiones y preparaciones para articulaciones.",
        care: "Manipular con cuidado. Consultar si hay embarazo, presiÃ³n baja o uso de diurÃ©ticos."
    },
    [normalizarTexto("Pasiflora")]: {
        info: "Planta trepadora usada en infusiones para relajaciÃ³n, nervios leves y sueÃ±o.",
        care: "Puede causar somnolencia. Evitar mezclar con alcohol, sedantes o manejar despuÃ©s de tomarla."
    },
    [normalizarTexto("Perejil")]: {
        info: "Hierba culinaria fresca usada para sabor y como apoyo diurÃ©tico tradicional.",
        care: "Evitar preparados concentrados en embarazo o enfermedad renal."
    },
    [normalizarTexto("Romero")]: {
        info: "Arbusto aromÃ¡tico usado en cocina, infusiones y fricciones externas tradicionales.",
        care: "Evitar aceite esencial por vÃ­a oral. Consultar si hay epilepsia, embarazo o presiÃ³n alta."
    },
    [normalizarTexto("Ruda")]: {
        info: "Planta de olor fuerte usada en tradiciÃ³n popular para cÃ³licos y rituales.",
        care: "No usar en embarazo. Puede ser tÃ³xica en dosis altas y causar irritaciÃ³n."
    },
    [normalizarTexto("Salvia")]: {
        info: "Planta aromÃ¡tica usada en infusiones y gÃ¡rgaras tradicionales para garganta y digestiÃ³n.",
        care: "Evitar uso prolongado o concentrado. Consultar en embarazo, lactancia o epilepsia."
    },
    [normalizarTexto("SÃ¡bila")]: {
        info: "Nombre comÃºn del aloe vera, planta de hojas carnosas con gel usado en piel.",
        care: "Usar el gel limpio de forma externa. No ingerir el lÃ¡tex amarillo."
    },
    [normalizarTexto("Sauco")]: {
        info: "Planta de flores pequeÃ±as usada en infusiones tradicionales durante resfriados leves.",
        care: "No consumir partes crudas o verdes. Consultar si hay embarazo o enfermedad autoinmune."
    },
    [normalizarTexto("TÃ© verde")]: {
        info: "InfusiÃ³n de hojas de Camellia sinensis, apreciada por su sabor y contenido de cafeÃ­na.",
        care: "Puede causar insomnio o acidez. Moderar si hay ansiedad, presiÃ³n alta o embarazo."
    },
    [normalizarTexto("Tilo")]: {
        info: "Flor usada en infusiones tradicionales para relajaciÃ³n, descanso y nervios leves.",
        care: "Puede causar sueÃ±o. Evitar mezclar con sedantes o alcohol."
    },
    [normalizarTexto("Tomillo")]: {
        info: "Hierba aromÃ¡tica usada en cocina e infusiones tradicionales para garganta y digestiÃ³n.",
        care: "Evitar aceites esenciales por vÃ­a oral. Consultar en embarazo o alergias."
    },
    [normalizarTexto("Toronjil")]: {
        info: "Planta aromÃ¡tica de olor cÃ­trico, tambiÃ©n conocida como melisa, usada para calma y digestiÃ³n.",
        care: "Puede causar somnolencia. Consultar si se toman medicamentos sedantes o tiroideos."
    },
    [normalizarTexto("Valeriana")]: {
        info: "RaÃ­z usada tradicionalmente para sueÃ±o, relajaciÃ³n y nervios leves.",
        care: "Puede causar somnolencia. No mezclar con alcohol, sedantes ni manejar despuÃ©s."
    },
    [normalizarTexto("Zacate limÃ³n")]: {
        info: "Hierba de aroma cÃ­trico usada en infusiones refrescantes y relajantes.",
        care: "Usar infusiones suaves. Consultar en embarazo o si causa acidez."
    },
    [normalizarTexto("Zarzaparrilla")]: {
        info: "Planta trepadora cuya raÃ­z se usa tradicionalmente en bebidas y preparados de bienestar.",
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
            info: detalle.info || "Planta de uso tradicional en cuidados caseros y alimentaciÃ³n.",
            care: detalle.care || "Usar con moderaciÃ³n y consultar con personal de salud ante dudas o sÃ­ntomas persistentes.",
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

const recipeSearch = document.getElementById("recipeSearch");
const recipeSearchStatus = document.getElementById("recipeSearchStatus");
const recipeSuggestions = document.getElementById("recipeSuggestions");
const recipeCards = document.querySelectorAll("[data-recipe-card]");
const featuredRecipeCount = 6;
const recipeIndex = Array.from(recipeCards)
    .map((card, index) => {
        const nombre = card.querySelector("h3")?.textContent.trim();
        const plantas = (card.dataset.recipePlants || "").trim();
        const resumen = card.querySelector(".recipe-summary")?.textContent.trim() || "";
        const contenido = normalizarTexto(card.textContent);
        const busqueda = normalizarTexto(`${nombre || ""} ${plantas} ${resumen} ${card.dataset.recipeKeywords || ""}`);
        const bloques = card.querySelectorAll(".recipe-columns > div");
        const ingredientes = Array.from(bloques[0]?.querySelectorAll("li") || [])
            .map((li) => li.textContent.trim())
            .filter(Boolean);
        const pasos = Array.from(bloques[1]?.querySelectorAll("li") || [])
            .map((li) => li.textContent.trim())
            .filter(Boolean);
        const consejo = card.querySelector(".recipe-tip")?.textContent.replace(/^Consejo:\s*/i, "").trim() || "";
        const warning = card.querySelector(".recipe-warning")?.textContent.replace(/^PrecauciÃ³n:\s*/i, "").trim() || "";

        return {
            card,
            nombre,
            nombreTexto: normalizarTexto(nombre || ""),
            plantas,
            plantasTexto: normalizarTexto(plantas),
            resumen,
            contenido,
            busqueda,
            ingredientes,
            pasos,
            consejo,
            warning,
            index
        };
    })
    .filter((item) => item.nombre);

function actualizarOpcionesReceta(termino) {
    if (!recipeSuggestions || !recipeSearch) {
        return;
    }

    recipeSuggestions.replaceChildren();

    if (!termino) {
        recipeSuggestions.classList.remove("visible");
        recipeSearch.setAttribute("aria-expanded", "false");
        return;
    }

    const coincidencias = recipeIndex
        .filter((item) => item.busqueda.includes(termino))
        .slice(0, 8);

    recipeSuggestions.classList.toggle("visible", coincidencias.length > 0);
    recipeSearch.setAttribute("aria-expanded", String(coincidencias.length > 0));

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
        hint.textContent = item.plantas || "Ver receta";

        copy.append(name, hint);
        button.append(mark, copy);

        button.addEventListener("click", () => {
            recipeSearch.value = item.nombre;
            filtrarRecetas();
            item.card.scrollIntoView({ behavior: "smooth", block: "center" });
            recipeSuggestions.classList.remove("visible");
            recipeSearch.setAttribute("aria-expanded", "false");
            recipeSearch.focus();
        });

        recipeSuggestions.appendChild(button);
    });
}

function filtrarRecetas() {
    if (!recipeSearch) {
        return;
    }

    const termino = normalizarTexto(recipeSearch.value.trim());
    let visibles = 0;

    actualizarOpcionesReceta(termino);

    recipeIndex.forEach((item) => {
        const coincide = !termino
            ? true
            : item.busqueda.includes(termino) || item.contenido.includes(termino);
        const mostrar = termino ? coincide : item.index < featuredRecipeCount;
        item.card.classList.toggle("is-hidden", !mostrar);
        item.card.classList.toggle("search-match", Boolean(termino) && coincide);

        if (mostrar) {
            visibles += 1;
        }
    });

    if (recipeSearchStatus) {
        if (!termino) {
            recipeSearchStatus.textContent = `Muestra ${featuredRecipeCount} recetas destacadas de ${recipeIndex.length}. Escribe una planta o una letra para ver todas las recetas detalladas.`;
        } else if (visibles === 1) {
            recipeSearchStatus.textContent = "1 receta relacionada encontrada.";
        } else if (visibles > 1) {
            recipeSearchStatus.textContent = `${visibles} recetas relacionadas encontradas.`;
        } else {
            recipeSearchStatus.textContent = "No se encontraron recetas con esas letras.";
        }
    }
}

if (recipeSearch && recipeCards.length) {
    recipeSearch.addEventListener("input", filtrarRecetas);
    recipeSearch.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && recipeSuggestions) {
            recipeSuggestions.classList.remove("visible");
            recipeSearch.setAttribute("aria-expanded", "false");
        }
    });

    document.addEventListener("click", (event) => {
        const target = event.target;

        if (recipeSuggestions && target instanceof Element && !target.closest(".recipe-search")) {
            recipeSuggestions.classList.remove("visible");
            recipeSearch.setAttribute("aria-expanded", "false");
        }
    });

    filtrarRecetas();
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
            mensaje = "Tus respuestas indican seÃ±ales que conviene atender pronto. Busca orientaciÃ³n en una unidad de salud, especialmente si los sÃ­ntomas son fuertes o persistentes.";
        } else if (total >= 5) {
            titulo = "Cuidado preventivo recomendado";
            mensaje = "Hay algunos puntos que puedes mejorar desde hoy. Observa tus sÃ­ntomas y refuerza hÃ¡bitos de prevenciÃ³n durante los prÃ³ximos dÃ­as.";
        } else if (total >= 2) {
            titulo = "Vas bien, con pequeÃ±os ajustes";
            mensaje = "Tus respuestas muestran un estado general estable, pero hay detalles que puedes fortalecer para prevenir riesgos.";
        } else {
            titulo = "Buen cuidado general";
            mensaje = "Tus respuestas reflejan buenos hÃ¡bitos de salud. MantÃ©n la higiene, la hidrataciÃ³n, la alimentaciÃ³n variada y la prevenciÃ³n en casa.";
        }

        if (sintomas >= 2) {
            consejos.push("Vigila fiebre, dolor fuerte, tos persistente o dificultad para respirar.");
        }

        if (habitos >= 1) {
            consejos.push("Mejora el consumo de agua y procura comidas mÃ¡s variadas.");
        }

        if (prevencion >= 1) {
            consejos.push("Refuerza lavado de manos, agua segura y eliminaciÃ³n de criaderos.");
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
                <p>Completa edad, gÃ©nero, peso y altura para calcular el IMC.</p>
            `;
            imcResult.classList.add("visible");
            return;
        }

        if (edad < 18) {
            categoria = "Resultado orientativo";
            mensaje = "En menores de 18 aÃ±os el IMC se interpreta con tablas de crecimiento segÃºn edad y sexo. Comparte este resultado con personal de salud para una orientaciÃ³n adecuada.";
        } else if (imc < 18.5) {
            categoria = "Bajo peso";
            mensaje = "Tu IMC estÃ¡ por debajo del rango de referencia para personas adultas. Procura una alimentaciÃ³n suficiente y consulta si hay pÃ©rdida de peso, cansancio o falta de apetito.";
        } else if (imc < 25) {
            categoria = "Rango saludable";
            mensaje = "Tu IMC estÃ¡ dentro del rango de referencia para personas adultas. MantÃ©n hÃ¡bitos de alimentaciÃ³n variada, hidrataciÃ³n y actividad fÃ­sica.";
        } else if (imc < 30) {
            categoria = "Sobrepeso";
            mensaje = "Tu IMC estÃ¡ por encima del rango saludable. Puede ayudar revisar porciones, actividad fÃ­sica y consumo de agua; busca orientaciÃ³n si tienes presiÃ³n alta, diabetes u otros riesgos.";
        } else {
            categoria = "Obesidad";
            mensaje = "Tu IMC indica obesidad en rangos adultos. Es recomendable recibir orientaciÃ³n profesional para cuidar tu salud de forma segura y progresiva.";
        }

        imcResult.innerHTML = `
            <strong>${categoria}</strong>
            <p>IMC: ${imc.toFixed(1)} | Peso: ${peso} ${unidadPeso} | Edad: ${edad} | GÃ©nero: ${genero}</p>
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
        nombre: "Hospital Alfonso Moncada GuillÃ©n",
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
        lugar: "EstelÃ­",
        departamento: "EstelÃ­",
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
        nombre: "Hospital Escuela CÃ©sar Amador Molina",
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
        nombre: "Hospital EspaÃ±a",
        lugar: "Chinandega",
        departamento: "Chinandega",
        lat: 12.6294,
        lon: -87.1311,
        tipo: "regional"
    },
    {
        nombre: "Hospital Escuela Oscar Danilo Rosales",
        lugar: "LeÃ³n",
        departamento: "LeÃ³n",
        lat: 12.4379,
        lon: -86.8780,
        tipo: "regional"
    },
    {
        nombre: "Hospital Antonio LenÃ­n Fonseca",
        lugar: "Managua",
        departamento: "Managua",
        lat: 12.1440,
        lon: -86.2893,
        tipo: "nacional"
    },
    {
        nombre: "Hospital Bertha CalderÃ³n Roque",
        lugar: "Managua",
        departamento: "Managua",
        lat: 12.1307,
        lon: -86.2747,
        tipo: "nacional"
    },
    {
        nombre: "Hospital Infantil Manuel de JesÃºs Rivera La Mascota",
        lugar: "Managua",
        departamento: "Managua",
        lat: 12.1257,
        lon: -86.2557,
        tipo: "nacional"
    },
    {
        nombre: "Hospital AlemÃ¡n NicaragÃ¼ense",
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
        nombre: "Hospital Occidental Fernando VÃ©lez Paiz",
        lugar: "Managua",
        departamento: "Managua",
        lat: 12.1183,
        lon: -86.2992,
        tipo: "nacional"
    },
    {
        nombre: "Hospital JosÃ© Nieborowski",
        lugar: "Boaco",
        departamento: "Boaco",
        lat: 12.4690,
        lon: -85.6586,
        tipo: "normal"
    },
    {
        nombre: "Hospital Humberto Alvarado VÃ¡squez",
        lugar: "Masaya",
        departamento: "Masaya",
        lat: 11.9744,
        lon: -86.0942,
        tipo: "regional"
    },
    {
        nombre: "Hospital Amistad JapÃ³n-Nicaragua",
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
        nombre: "Hospital Gaspar GarcÃ­a Laviana",
        lugar: "Rivas",
        departamento: "Rivas",
        lat: 11.4372,
        lon: -85.8263,
        tipo: "regional"
    },
    {
        nombre: "Hospital Escuela AsunciÃ³n",
        lugar: "Juigalpa",
        departamento: "Chontales",
        lat: 12.1063,
        lon: -85.3647,
        tipo: "regional"
    },
    {
        nombre: "Hospital Jacinto HernÃ¡ndez",
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
        departamento: "RÃ­o San Juan",
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




var data;

var mon = {
    name: "Monster",
    size: 12,
    type: "humanoid",
    tag: "",
    alignment: "any alignment",
    armor: 5,
    initiativeDie: 5,
    speed: 10,
    burrowSpeed: 0,
    climbSpeed: 0,
    flySpeed: 0,
    hover: false,
    swimSpeed: 0,
    customHP: null,
    customResolve: null,
    customSpeed: false,
    customInitiative: null,
    speedDesc: "10 m.",
    strPoints: 5,
    agiPoints: 5,
    prePoints: 5,
    conPoints: 5,
    intPoints: 5,
    insPoints: 5,
    chaPoints: 5,
    affPoints: 5,
    wilPoints: 5,
    blindsight: 0,
    blind: false,
    lowlightvision: 0,
    darkvision: 0,
    tremorsense: 0,
    truesight: 0,
    telepathy: 0,
    cr: 1,
    isLegendary: false,
    legendariesDescription: "",
    isLair: false,
    lairDescription: "",
    lairDescriptionEnd: "",
    isRegional: false,
    regionalDescription: "",
    regionalDescriptionEnd: "",
    properties: [],
    abilities: [],
    actions: [],
    reactions: [],
    legendaries: [],
    lairs: [],
    regionals: [],
    sthrows: [],
    skills: [],
    damagetypes: [],
    specialdamage: [],
    conditions: [],
    languages: [],
    understandsBut: "",
    shortName: "",
    doubleColumns: false,
    separationPoint: 1
};

var sizeLabels = {
   0: 'Miniscule',
   4: 'Tiny',
   8: 'Small',
   12: 'Medium',
   20: 'Large',
   28: 'Huge',
   40: 'Enormous',
   60: 'Colossal',
};

// Save function
var TrySaveFile = () => {
    SavedData.SaveToFile();
}

// Upload file function
var LoadFilePrompt = () => {
    $("#file-upload").click();
}

// Load function
var TryLoadFile = () => {
    SavedData.RetrieveFromFile();
}

// Print function
function TryPrint() {
    let printWindow = window.open();
    printWindow.document.write('<html><head><meta charset="utf-8"/><title>' + mon.name + '</title><link rel="shortcut icon" type="image/x-icon" href="./dndimages/favicon.ico" /><link rel="stylesheet" type="text/css" href="css/statblock-style.css"><link rel="stylesheet" type="text/css" href="css/libre-baskerville.css"><link rel="stylesheet" type="text/css" href="css/noto-sans.css"></head><body><div id="print-block" class="content">');
    printWindow.document.write($("#stat-block-wrapper").html());
    printWindow.document.write('</div></body></html>');
}

// View as image function
function TryImage() {
    domtoimage.toBlob(document.getElementById("stat-block"))
        .then(function (blob) {
            window.saveAs(blob, mon.name.toLowerCase() + ".png");
        });
}

// Update the main stat block from form variables
function UpdateBlockFromVariables(moveSeparationPoint) {
    GetVariablesFunctions.GetAllVariables();
    UpdateStatblock(moveSeparationPoint);
}

// Functions for saving/loading data
var SavedData = {
    // Saving

    SaveToLocalStorage: () => localStorage.setItem("SavedData", JSON.stringify(mon)),

    SaveToFile: () => saveAs(new Blob([JSON.stringify(mon)], {
        type: "text/plain;charset=utf-8"
    }), mon.name.toLowerCase() + ".monster"),

    // Retrieving

    RetrieveFromLocalStorage: function () {
        let savedData = localStorage.getItem("SavedData");
        if (savedData != undefined)
            mon = JSON.parse(savedData);
    },

    RetrieveFromFile: function () {
        let file = $("#file-upload").prop("files")[0],
            reader = new FileReader();

        reader.onload = function (e) {
            mon = JSON.parse(reader.result);
            Populate();
        };

        reader.readAsText(file);
    },
}

// Update the main stat block
function UpdateStatblock(moveSeparationPoint) {
    // Set Separation Point
    let separationMax = mon.abilities.length + mon.actions.length + mon.reactions.length - 1;

    if (mon.isLegendary)
        separationMax += (mon.legendaries.length == 0 ? 1 : mon.legendaries.length);

    if (mon.isLair)
        separationMax += (mon.lairs.length == 0 ? 1 : mon.lairs.length);

    if (mon.isRegional)
        separationMax += (mon.regionals.length == 0 ? 1 : mon.regionals.length);

    if (mon.separationPoint == undefined)
        mon.separationPoint = Math.floor(separationMax / 2);

    if (moveSeparationPoint != undefined)
        mon.separationPoint = MathFunctions.Clamp(mon.separationPoint + moveSeparationPoint, 0, separationMax);

    // Save Before Continuing
    SavedData.SaveToLocalStorage();

    // One column or two columns
    let statBlock = $("#stat-block");
    mon.doubleColumns ? statBlock.addClass('wide') : statBlock.removeClass('wide');

    // Name and type
    $("#monster-name").html(StringFunctions.RemoveHtmlTags(mon.name));
    $("#monster-type").html(sizeLabels[mon.size] + " " + mon.type +
        (mon.tag == "" ? ", " : " (" + mon.tag + "), ") + mon.alignment);

    // Armor
    $('#armor-class').html(mon.armor);

    // Hit Points
    $("#hit-points").html(StringFunctions.FormatString(StringFunctions.RemoveHtmlTags(StringFunctions.GetHP())));

    // Resolve
    $("#res-points").html(StringFunctions.FormatString(StringFunctions.RemoveHtmlTags(StringFunctions.GetResolve())));

    // Initiative
    $('#initiative-points').html(StringFunctions.FormatString(StringFunctions.RemoveHtmlTags(StringFunctions.GetInitiative())));
    $('#initiative-die-points').html(mon.initiativeDie);

    // Speed
    $("#speed").html(StringFunctions.FormatString(StringFunctions.RemoveHtmlTags(StringFunctions.GetSpeed())));

    // Stats
    let setPts = (id, pts) =>
        $(id).html(pts);
    setPts("#strpts", mon.strPoints);
    setPts("#agipts", mon.agiPoints);
    setPts("#prepts", mon.prePoints);
    setPts("#conpts", mon.conPoints);
    setPts("#intpts", mon.intPoints);
    setPts("#inspts", mon.insPoints);
    setPts("#chapts", mon.chaPoints);
    setPts("#affpts", mon.affPoints);
    setPts("#wilpts", mon.wilPoints);

    let propertiesDisplayArr = StringFunctions.GetPropertiesDisplayArr();

    // Display All Properties (except CR)
    let propertiesDisplayList = [];
    propertiesDisplayList.push(StringFunctions.MakePropertyHTML(propertiesDisplayArr[0], true));
    for (let index = 1; index < propertiesDisplayArr.length; index++)
        propertiesDisplayList.push(StringFunctions.MakePropertyHTML(propertiesDisplayArr[index]));
    $("#properties-list").html(propertiesDisplayList.join(""));

    // Challenge Rating
    $("#challenge-rating").html(mon.cr);

    // Abilities
    let traitsHTML = [];

    if (mon.abilities.length > 0) AddToTraitList(traitsHTML, mon.abilities);
    if (mon.actions.length > 0) AddToTraitList(traitsHTML, mon.actions, "<h3>Actions</h3>");
    if (mon.reactions.length > 0) AddToTraitList(traitsHTML, mon.reactions, "<h3>Reactions</h3>");
    if (mon.isLegendary)
        AddToTraitList(traitsHTML, mon.legendaries, mon.legendariesDescription == "" ? "<h3>Legendary Actions</h3>" : ["<h3>Legendary Actions</h3><div class='property-block'>", ReplaceTags(StringFunctions.RemoveHtmlTags(mon.legendariesDescription)), "</div></br>"], true);
    if (mon.isLair && mon.isLegendary) {
        AddToTraitList(traitsHTML, mon.lairs, mon.lairDescription == "" ? "<h3>Lair Actions</h3>" : ["<h3>Lair Actions</h3><div class='property-block'>", ReplaceTags(StringFunctions.RemoveHtmlTags(mon.lairDescription)), "</div></br><ul>"], false, true);
        traitsHTML.push("</ul>" + ReplaceTags(mon.lairDescriptionEnd));
    }
    if (mon.isRegional && mon.isLegendary) {
        AddToTraitList(traitsHTML, mon.regionals, mon.regionalDescription == "" ? "<h3>Regional Effects</h3>" : ["<h3>Regional Effects</h3><div class='property-block'>", ReplaceTags(StringFunctions.RemoveHtmlTags(mon.regionalDescription)), "</div></br><ul>"], false, true);
        traitsHTML.push("</ul>" + ReplaceTags(mon.regionalDescriptionEnd));
    }

    // Add traits, taking into account the width of the block (one column or two columns)
    let leftTraitsArr = [],
        rightTraitsArr = [],
        separationCounter = 0;
    for (let index = 0; index < traitsHTML.length; index++) {
        let trait = traitsHTML[index],
            raiseCounter = true;
        if (trait[0] == "*") {
            raiseCounter = false;
            trait = trait.substr(1);
        }
        (separationCounter < mon.separationPoint ? leftTraitsArr : rightTraitsArr).push(trait);
        if (raiseCounter)
            separationCounter++;
    }
    $("#traits-list-left").html(leftTraitsArr.join(""));
    $("#traits-list-right").html(rightTraitsArr.join(""));

    // Show or hide the separator input depending on how many columns there are
    FormFunctions.ShowHideSeparatorInput();
}

// Function used by UpdateStatblock for abilities
function AddToTraitList(traitsHTML, traitsArr, addElements, isLegendary = false, isLairRegional = false) {

    // Add specific elements to the beginning of the array, usually a header
    if (addElements != undefined) {
        if (Array.isArray(addElements)) {
            for (let index = 0; index < addElements.length; index++)
                traitsHTML.push("*" + addElements[index]);
        } else
            traitsHTML.push("*" + addElements);
    }

    // There's a small difference in formatting for legendary actions and lair/regional actions
    for (let index = 0; index < traitsArr.length; index++) {
        if (isLegendary) {
            traitsHTML.push(StringFunctions.MakeTraitHTMLLegendary(traitsArr[index].name, ReplaceTags(traitsArr[index].desc)));
        } else if (isLairRegional) {
            traitsHTML.push(StringFunctions.MakeTraitHTMLLairRegional(traitsArr[index].name, ReplaceTags(traitsArr[index].desc)));
        } else {
            traitsHTML.push(StringFunctions.MakeTraitHTML(traitsArr[index].name, ReplaceTags(traitsArr[index].desc)));
        }
    }
}

function ReplaceTags(desc) {
    const bracketExp = /\[(.*?)\]/g,
        damageExp = /\d*d\d+/,
        bonusExp = /^[+-] ?(\d+)$/;
    let matches = [],
        match = null;
    while ((match = bracketExp.exec(desc)) != null)
        matches.push(match);

    matches.forEach(function (match) {
        const GetPoints = (pts) => data.statNames.includes(pts) ? MathFunctions.PointsToBonus(mon[pts + "Points"]) : null;
        let readString = match[1].toLowerCase().replace(/ +/g, ' ').trim();

        if (readString.length > 0) {
            if (readString == "mon")
                if (mon.shortName && mon.shortName.length > 0)
                    desc = desc.replace(match[0], mon.shortName);
                else
                    desc = desc.replace(match[0], mon.name);
            else {
                let readPosition = 0,
                    type = null,
                    statPoints = GetPoints(readString.substring(0, 3)),
                    bonus = 0,
                    roll = null;

                // Get stat mods
                if (statPoints != null) {
                    bonus = statPoints;
                    readPosition = 3;
                    type = "stat";
                    if (readString.length > 3) {
                        if (readString.substring(3, 7) == " atk") {
                            readPosition = 7;
                            type = "atk";
                        } else if (readString.substring(3, 8) == " save") {
                            readPosition = 8;
                            type = "save";
                        }
                    }

                    if (readPosition < readString.length) {
                        if (readString[readPosition] == " ")
                            readPosition++;
                        else
                            type = "error";
                    }
                }

                // Get roll
                if ((type == null || type == "stat") && readPosition < readString.length) {
                    let nextSpace = readString.indexOf(" ", readPosition),
                        nextToken = nextSpace >= 0 ? readString.substring(readPosition, nextSpace) : readString.substring(readPosition);

                    if (damageExp.test(nextToken)) {
                        roll = nextToken;
                        readPosition += nextToken.length;
                        type = "dmg";

                        if (readPosition < readString.length) {
                            if (readString[readPosition] == " ")
                                readPosition++;
                            else
                                type = "error";
                        }
                    }
                }

                // Get bonus
                if (type != "error" && readPosition < readString.length) {
                    let nextToken = readString.substring(readPosition),
                        bonusMatch = nextToken.match(bonusExp);
                    if (bonusMatch)
                        bonus += nextToken[0] == "-" ? -parseInt(bonusMatch[1]) : parseInt(bonusMatch[1]);
                    else
                        type = "error";
                }

                // Make the string
                if (type != null && type != "error") {
                    let replaceString = null;
                    switch (type) {
                        case "stat":
                        case "atk":
                            replaceString = StringFunctions.BonusFormat(bonus);
                            break;
                        case "save":
                            replaceString = bonus;
                            break;
                        case "dmg":
                            let splitRoll = roll.split("d"),
                                multiplier = splitRoll[0].length > 0 ? parseInt(splitRoll[0]) : 1,
                                dieSize = parseInt(splitRoll[1]);
                            replaceString = Math.max(Math.floor(multiplier * ((dieSize + 1) / 2) + bonus), 1) + " (" + multiplier + "d" + dieSize;
                            replaceString += bonus > 0 ?
                                " + " + bonus : bonus < 0 ?
                                    " - " + -bonus : "";
                            replaceString += ")";
                            break;
                    }
                    desc = desc.replace(match[0], replaceString);
                }
            }
        }
    });

    return desc;
}

// Homebrewery/GM Binder markdown
function TryMarkdown() {
    let markdownWindow = window.open();
    let markdown = ['<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><title>', mon.name, '</title><link rel="shortcut icon" type="image/x-icon" href="./dndimages/favicon.ico" /></head><body><h2>Homebrewery/GM Binder Markdown</h2><code>', mon.doubleColumns ? "___<br>___<br>" : "___<br>", '> ## ', mon.name, '<br>>*', sizeLabels[mon.size], ' ', mon.type];
    if (mon.tag != "")
        markdown.push(' (', mon.tag, ')');
    markdown.push(', ', mon.alignment, '*<br>>___<br>> - **Armor Value** ', StringFunctions.FormatString(StringFunctions.GetArmorData()), '<br>> - **Hit Points** ', StringFunctions.GetHP(), '<br>> - **Resolve** ', StringFunctions.GetResolve(), '<br>> - **Speed** ', StringFunctions.GetSpeed(), "<br>>___<br>>|STR|DEX|CON|INT|WIS|CHA|<br>>|:---:|:---:|:---:|:---:|:---:|:---:|<br>>|",
        mon.strPoints, " (", StringFunctions.BonusFormat(MathFunctions.PointsToBonus(mon.strPoints)), ")|",
        mon.agiPoints, " (", StringFunctions.BonusFormat(MathFunctions.PointsToBonus(mon.agiPoints)), ")|",
        mon.perPoints, " (", StringFunctions.BonusFormat(MathFunctions.PointsToBonus(mon.perPoints)), ")|",
        mon.conPoints, " (", StringFunctions.BonusFormat(MathFunctions.PointsToBonus(mon.conPoints)), ")|",
        mon.intPoints, " (", StringFunctions.BonusFormat(MathFunctions.PointsToBonus(mon.intPoints)), ")|",
        mon.insPoints, " (", StringFunctions.BonusFormat(MathFunctions.PointsToBonus(mon.insPoints)), ")|",
        mon.chaPoints, " (", StringFunctions.BonusFormat(MathFunctions.PointsToBonus(mon.chaPoints)), ")|",
        mon.affPoints, " (", StringFunctions.BonusFormat(MathFunctions.PointsToBonus(mon.affPoints)), ")|",
        mon.wilPoints, " (", StringFunctions.BonusFormat(MathFunctions.PointsToBonus(mon.wilPoints)), ")|<br>>___<br>");

    let propertiesDisplayArr = StringFunctions.GetPropertiesDisplayArr();

    for (let index = 0; index < propertiesDisplayArr.length; index++) {
        markdown.push('> - **', propertiesDisplayArr[index].name, "** ",
            (Array.isArray(propertiesDisplayArr[index].arr) ? propertiesDisplayArr[index].arr.join(", ") : propertiesDisplayArr[index].arr),
            "<br>");
    }
    markdown.push("> - **Challenge** ", mon.cr, "<br>>___");

    if (mon.abilities.length > 0) markdown.push("<br>", GetTraitMarkdown(mon.abilities, false));
    if (mon.actions.length > 0) markdown.push("<br>> ### Actions<br>", GetTraitMarkdown(mon.actions, false));
    if (mon.reactions.length > 0) markdown.push("<br>> ### Reactions<br>", GetTraitMarkdown(mon.reactions, false));
    if (mon.isLegendary) {
        markdown.push("<br>> ### Legendary Actions<br>> ", ReplaceTags(mon.legendariesDescription));
        if (mon.legendaries.length > 0) markdown.push("<br>><br>", GetTraitMarkdown(mon.legendaries, true));
    }
    if (mon.isLair && mon.isLegendary) {
        markdown.push("<br>> ### Lair Actions<br>> ", ReplaceTags(mon.lairDescription));
        if (mon.lairs.length > 0) markdown.push("<br>><br>", GetTraitMarkdown(mon.lairs, false, true));
        markdown.push("<br>><br>>", ReplaceTags(mon.lairDescriptionEnd));
    }
    if (mon.isRegional && mon.isLegendary) {
        markdown.push("<br>><br>> ### Regional Effects<br>> ", ReplaceTags(mon.regionalDescription));
        if (mon.regionals.length > 0) markdown.push("<br>><br>", GetTraitMarkdown(mon.regionals, false, true));
        markdown.push("<br>><br>>", ReplaceTags(mon.regionalDescriptionEnd));
    }

    markdown.push("</code></body></html>")

    markdownWindow.document.write(markdown.join(""));
}

function GetTraitMarkdown(traitArr, legendary = false, lairOrRegional = false) {
    let markdown = [];
    for (let index = 0; index < traitArr.length; index++) {
        let desc = ReplaceTags(traitArr[index].desc)
            .replace(/(\r\n|\r|\n)\s*(\r\n|\r|\n)/g, '\n>\n')
            .replace(/(\r\n|\r|\n)>/g, '\&lt;br&gt;<br>>')
            .replace(/(\r\n|\r|\n)/g, '\&lt;br&gt;<br>> &amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;');
        markdown.push("> " +
            (legendary ? "**" : (lairOrRegional ? "* " : "***")) +
            (lairOrRegional ? "" : traitArr[index].name) +
            (legendary ? ".** " : lairOrRegional ? "" : (".*** ")) +
            desc);
    }
    return markdown.join("<br>><br>");
}

// Functions for form-setting
var FormFunctions = {
    // Set the forms
    SetForms: function () {
        // Name and type
        $("#name-input").val(mon.name);
        $("#size-input").val(mon.size);

        if (data.types.includes(mon.type))
            $("#type-input").val(mon.type);
        else {
            $("#type-input").val("*");
            $("#other-type-input").val(mon.type);
        }
        this.ShowHideTypeOther();

        // Tag and Alignment
        $("#tag-input").val(mon.tag);
        $("#alignment-input").val(mon.alignment);

        // Armor & HP
        $("#armor-input").val(mon.armor);
        $("#hp-text-input").val(mon.customHP);
        $("#res-test-input").val(mon.customResolve);
        this.UpdateHitDie();

        // Initiative
        $("#initiative-input").val(mon.customInitiative);
        $("#initiative-die-input").val(mon.initiativeDie);

        // Speeds
        $("#speed-input").val(mon.speed);
        $("#burrow-speed-input").val(mon.burrowSpeed);
        $("#climb-speed-input").val(mon.climbSpeed);
        $("#fly-speed-input").val(mon.flySpeed);
        $("#hover-input").prop("checked", mon.hover);
        this.ShowHideHoverBox();
        $("#swim-speed-input").val(mon.swimSpeed);
        $("#custom-speed-prompt").val(mon.speedDesc);
        $("#custom-speed-input").prop("checked", mon.customSpeed);
        this.ShowHideCustomSpeed();

        // Stats
        this.SetStatForm("str", mon.strPoints);
        this.SetStatForm("agi", mon.agiPoints);
        this.SetStatForm("pre", mon.prePoints);
        this.SetStatForm("con", mon.conPoints);
        this.SetStatForm("int", mon.intPoints);
        this.SetStatForm("ins", mon.insPoints);
        this.SetStatForm("cha", mon.chaPoints);
        this.SetStatForm("aff", mon.affPoints);
        this.SetStatForm("wil", mon.wilPoints);

        // Senses
        $("#blindsight-input").val(mon.blindsight);
        $("#blindness-input").prop("checked", mon.blind);
        this.ShowHideBlindBox();
        $("#lowlightvision-input").val(mon.lowlightvision);
        $("#darkvision-input").val(mon.darkvision);
        $("#tremorsense-input").val(mon.tremorsense);
        $("#truesight-input").val(mon.truesight);

        // Properties
        this.MakeDisplayList("sthrows", true);
        this.MakeDisplayList("skills", true);
        this.MakeDisplayList("conditions", true);
        this.MakeDisplayList("damage", true);
        this.ShowHideDamageOther();
        this.MakeDisplayList("languages", false);
        $("#understands-but-input").val(mon.understandsBut);
        this.ShowHideLanguageOther();
        $("#telepathy-input").val(mon.telepathy);

        // Abilities
        $("#short-name-input").val(mon.shortName);
        this.MakeDisplayList("abilities", false, true);
        this.MakeDisplayList("actions", false, true);
        this.MakeDisplayList("reactions", false, true);
        this.MakeDisplayList("legendaries", false, true);
        this.MakeDisplayList("lairs", false, true);
        this.MakeDisplayList("regionals", false, true);

        // Is Legendary?
        $("#is-legendary-input").prop("checked", mon.isLegendary);
        this.ShowHideLegendaryCreature();

        // Is Lair?
        $("#has-lair-input").prop("checked", mon.isLair);
        this.ShowHideLair();

        // Is Regional?
        $("#has-regional-input").prop("checked", mon.isRegional);
        this.ShowHideRegional();

        // Challenge Rating
        $("#cr-input").val(mon.cr);

        // Column Radio Buttons
        this.ChangeColumnRadioButtons();
    },

    // Show/Hide form options to make it less overwhelming - only call these from SetForms or HTML elements
    ShowHideHtmlElement: function (element, show) {
        show ? $(element).show() : $(element).hide();
    },

    ShowHideTypeOther: function () {
        this.ShowHideHtmlElement("#other-type-input", $("#type-input").val() == "*");
    },

    UpdateHitDie: function() {
        $('#size-hit-die').text('Hit Die: ' + $('#size-input').val());
    },

    ShowHideCustomSpeed: function () {
        $(".normal-speed-col, .custom-speed-col").hide();
        if ($("#custom-speed-input").prop('checked'))
            $(".custom-speed-col").show();
        else
            $(".normal-speed-col").show();
    },

    ShowHideDamageOther: function () {
        this.ShowHideHtmlElement("#other-damage-input", $("#damagetypes-input").val() == "*");
    },

    ShowHideLanguageOther: function () {
        this.ShowHideHtmlElement("#other-language-input", $("#languages-input").val() == "*");
    },

    ShowHideHoverBox: function () {
        this.ShowHideHtmlElement("#hover-box-note", $("#fly-speed-input").val() > 0);
    },

    ShowHideBlindBox: function () {
        this.ShowHideHtmlElement("#blind-box-note", $("#blindsight-input").val() > 0);
    },

    ShowHideSeparatorInput: function () {
        this.ShowHideHtmlElement("#left-separator-button", mon.doubleColumns);
        this.ShowHideHtmlElement("#right-separator-button", mon.doubleColumns);
    },

    ShowHideLegendaryCreature: function () {
        if ($("#is-legendary-input:checked").val()) {
            $("#add-legendary-button, #legendary-actions-form").show();
            if ($("#has-lair-input:checked").val())
                $("#add-lair-button, #lair-actions-form").show();
            if ($("#has-regional-input:checked").val())
                $("#add-regional-button, #regional-actions-form").show();
        } else {
            $("#add-legendary-button, #legendary-actions-form").hide();
            $("#add-lair-button, #add-regional-button, #lair-actions-form, #regional-actions-form").hide();
        }
    },

    ShowHideLair: function () {
        $("#has-lair-input:checked").val() ?
            $("#add-lair-button, #lair-actions-form").show() :
            $("#add-lair-button, #lair-actions-form").hide();
    },

    ShowHideRegional: function () {
        $("#has-regional-input:checked").val() ?
            $("#add-regional-button, #regional-actions-form").show() :
            $("#add-regional-button, #regional-actions-form").hide();
    },

    ShowHideFormatHelper: function () {
        this.ShowHideHtmlElement("#format-helper", $("#format-helper-checkbox:checked").val())
    },

    // Set the ability bonus given ability scores
    ChangeBonus: function (stat) {
        $("#" + stat + "bonus").html(StringFunctions.RemoveHtmlTags(StringFunctions.BonusFormat(MathFunctions.PointsToBonus($("#" + stat + "-input").val()))));
    },

    // For setting the column radio buttons based on saved data
    ChangeColumnRadioButtons: function () {
        $("#1col-input").prop("checked", !mon.doubleColumns);
        $("#2col-input").prop("checked", mon.doubleColumns);
    },

    // For setting the legendary action description
    SetLegendaryDescriptionForm: function () {
        $("#legendaries-descsection-input").val(mon.legendariesDescription);
    },

    // For setting the lair action description
    SetLairDescriptionForm: function () {
        $("#lair-descsection-input").val(mon.lairDescription);
    },

    // For setting the regional effect end description
    SetLairDescriptionEndForm: function () {
        $("#lair-end-descsection-input").val(mon.lairDescriptionEnd);
    },

    // For setting the regional effect description
    SetRegionalDescriptionForm: function () {
        $("#regional-descsection-input").val(mon.regionalDescription);
    },

    // For setting the regional effect end description
    SetRegionalDescriptionEndForm: function () {
        $("#regional-end-descsection-input").val(mon.regionalDescriptionEnd);
    },

    SetCommonAbilitiesDropdown: function () {
        $("#common-ability-input").html("");
        for (let index = 0; index < data.commonAbilities.length; index++)
            $("#common-ability-input").append("<option value='" + index + "'>" + data.commonAbilities[index].name + "</option>");
    },

    // Set ability scores and bonuses
    SetStatForm: function (statName, statPoints) {
        $("#" + statName + "-input").val(statPoints);
        $("#" + statName + "bonus").html(StringFunctions.RemoveHtmlTags(StringFunctions.BonusFormat(MathFunctions.PointsToBonus(statPoints))));
    },

    // Make a list of removable items and add it to the editor
    MakeDisplayList: function (arrName, capitalize, isBlock = false) {
        if (typeof mon[arrName] == 'undefined')
            mon[arrName] = [];
        let arr = (arrName == "damage" ? mon.damagetypes.concat(mon.specialdamage) : mon[arrName]),
            displayArr = [],
            content = "",
            arrElement = "#" + arrName + "-input-list";
        for (let index = 0; index < arr.length; index++) {
            let element = arr[index],
                elementName = capitalize ? StringFunctions.StringCapitalize(element.name) : element.name,
                note = element.hasOwnProperty("note") ? element.note : "";

            if (arrName == "languages") {
                content = "<b>" + StringFunctions.FormatString(elementName + note, false) + (element.speaks || element.speaks == undefined ? "" : " (understands)") + "</b>";
            }
            else if (arrName == "skills") {
                content = "<b>" + StringFunctions.FormatString(elementName + ' (' + element.value + ')', false) + '</b>';
            }
            else
                content = "<b>" + StringFunctions.FormatString(elementName + note, false) + (element.hasOwnProperty("desc") ?
                    ":</b> " + StringFunctions.FormatString(element.desc, isBlock) : "</b>");

            let functionArgs = arrName + "\", " + index + ", " + capitalize + ", " + isBlock,
                imageHTML = "<img class='statblock-image' src='dndimages/x-icon.png' alt='Remove' title='Remove' onclick='FormFunctions.RemoveDisplayListItem(\"" + functionArgs + ")'>";
            if (isBlock)
                imageHTML += " <img class='statblock-image' src='dndimages/edit-icon.png' alt='Edit' title='Edit' onclick='FormFunctions.EditDisplayListItem(\"" + functionArgs + ")'>" +
                    " <img class='statblock-image' src='dndimages/up-icon.png' alt='Up' title='Up' onclick='FormFunctions.SwapDisplayListItem(\"" + arrName + "\", " + index + ", -1)'>" +
                    " <img class='statblock-image' src='dndimages/down-icon.png' alt='Down' title='Down' onclick='FormFunctions.SwapDisplayListItem(\"" + arrName + "\", " + index + ", 1)'>";
            displayArr.push("<li> " + imageHTML + " " + content + "</li>");
        }
        $(arrElement).html(displayArr.join(""));

        $(arrElement).parent()[arr.length == 0 ? "hide" : "show"]();
    },

    // Remove an item from a display list and update it
    RemoveDisplayListItem: function (arrName, index, capitalize, isBlock) {
        let arr;
        if (arrName == "damage") {
            if (mon.damagetypes.length - index > 0)
                arr = mon.damagetypes;
            else {
                index -= mon.damagetypes.length;
                arr = mon.specialdamage;
            }
        } else
            arr = mon[arrName];
        arr.splice(index, 1);
        this.MakeDisplayList(arrName, capitalize, isBlock);
    },

    // Bring an item into the abilities textbox for editing
    EditDisplayListItem: function (arrName, index, capitalize) {
        let item = mon[arrName][index];
        $("#abilities-name-input").val(item.name);
        $("#abilities-desc-input").val(item.desc);
    },

    // Change position
    SwapDisplayListItem: function (arrName, index, swap) {
        arr = mon[arrName];
        if (index + swap < 0 || index + swap >= arr.length) return;
        let temp = arr[index + swap];
        arr[index + swap] = arr[index];
        arr[index] = temp;
        this.MakeDisplayList(arrName, false, true);
    },

    // Initialize Forms
    InitForms: function () {
        //
    }
}

// Input functions to be called only through HTML
var InputFunctions = {
    // Get all variables from a preset
    GetPreset: function () {
        let name = $("#monster-select").val();
        if (name == "") return;
        if (name == "default") {
            GetVariablesFunctions.SetPreset(data.defaultPreset);
            FormFunctions.SetForms();
            UpdateStatblock();
            return;
        }
        $.getJSON("https://api.open5e.com/monsters/" + name, function (jsonArr) {
            GetVariablesFunctions.SetPreset(jsonArr);
            FormFunctions.SetForms();
            UpdateStatblock();
        })
            .fail(function () {
                console.error("Failed to load preset.");
                return;
            })
    },

    // Adding items to lists

    AddSthrowInput: function () {
        // Insert, complying with standard stat order
        GetVariablesFunctions.AddSthrow($("#sthrows-input").val());

        // Display
        FormFunctions.MakeDisplayList("sthrows", true);
    },

    AddSkillInput: function () {
        // Get value.
        let value = $('#skills-value').val();
        if (value == "") return;

        // Insert Alphabetically
        GetVariablesFunctions.AddSkill($("#skills-input").val(), value);

        // Display
        FormFunctions.MakeDisplayList("skills", true);
    },

    AddDamageTypeInput: function (type) {
        // Insert normal damage alphabetically, then special damage alphabetically
        GetVariablesFunctions.AddDamageType($("#damagetypes-input").val(), type);

        // Display
        FormFunctions.MakeDisplayList("damage", true);
    },

    AddConditionInput: function () {
        // Insert alphabetically
        GetVariablesFunctions.AddCondition($("#conditions-input").val());

        // Display
        FormFunctions.MakeDisplayList("conditions", true);
    },

    AddLanguageInput: function (speaks) {
        // Insert alphabetically
        GetVariablesFunctions.AddLanguage($("#languages-input").val(), speaks);

        // Display
        FormFunctions.MakeDisplayList("languages", false);
    },

    // Change CR based on input dropdown
    InputCR: function () {
        mon.cr = $("#cr-input").val();
    },

    AddAbilityInput: function (arrName) {
        let abilityName = $("#abilities-name-input").val().trim(),
            abilityDesc = $("#abilities-desc-input").val().trim();

        if (abilityName.length == 0 || abilityDesc.length == 0)
            return;

        // Insert at end, or replace ability if it exists already
        GetVariablesFunctions.AddAbility(arrName, abilityName, abilityDesc, true);

        // Display
        FormFunctions.MakeDisplayList(arrName, false, true);

        // Clear forms
        $("#abilities-name-input").val("");
        $("#abilities-desc-input").val("");
    },

    // Reset legendary description to default
    LegendaryDescriptionDefaultInput: function () {
        GetVariablesFunctions.LegendaryDescriptionDefault();
        FormFunctions.SetLegendaryDescriptionForm();
    },

    // Reset lair description to default
    LairDescriptionDefaultInput: function () {
        GetVariablesFunctions.LairDescriptionDefault();
        FormFunctions.SetLairDescriptionForm();
        GetVariablesFunctions.LairDescriptionEndDefault();
        FormFunctions.SetLairDescriptionEndForm();
    },

    // Reset regional description to default
    RegionalDescriptionDefaultInput: function () {
        GetVariablesFunctions.RegionalDescriptionDefault();
        FormFunctions.SetRegionalDescriptionForm();
        GetVariablesFunctions.RegionalDescriptionEndDefault();
        FormFunctions.SetRegionalDescriptionEndForm();
    },

    AddCommonAbilityInput: function () {
        let commonAbility = data.commonAbilities[$("#common-ability-input").val()];
        if (commonAbility.desc) {
            $("#abilities-name-input").val(commonAbility.hasOwnProperty("realname") ? commonAbility.realname : commonAbility.name);
            $("#abilities-desc-input").val(commonAbility.desc);
            //$("#abilities-desc-input").val(StringFunctions.StringReplaceAll(commonAbility.desc, "[MON]", mon.name.toLowerCase()));
        }
    }
}

// Functions to get/set important variables
var GetVariablesFunctions = {
    // Get all Variables from forms
    GetAllVariables: function () {
        // Name and Type
        mon.name = $("#name-input").val().trim();
        mon.size = $("#size-input").val();
        mon.type = $("#type-input").val();
        if (mon.type == "*")
            mon.type = $("#other-type-input").val();
        mon.tag = $("#tag-input").val().trim();
        mon.alignment = $("#alignment-input").val().trim();

        // Armor Class
        mon.armor = $("#armor-input").val();

        // Hit Points and Resolve
        mon.customHP = $("#hp-custom-input").val();
        mon.customResolve = $("#res-custom-input").val();

        // Initiative
        mon.customInitiative = $("#initiative-input").val();
        mon.initiativeDie = $("#initiative-die-input").val();

        // Speeds
        mon.speed = $("#speed-input").val();
        mon.burrowSpeed = $("#burrow-speed-input").val();
        mon.climbSpeed = $("#climb-speed-input").val();
        mon.flySpeed = $("#fly-speed-input").val();
        mon.hover = $("#hover-input").prop("checked");
        mon.swimSpeed = $("#swim-speed-input").val();
        mon.speedDesc = $("#custom-speed-prompt").val();
        mon.customSpeed = $("#custom-speed-input").prop("checked");

        // Stats
        mon.strPoints = $("#str-input").val();
        mon.agiPoints = $("#agi-input").val();
        mon.prePoints = $("#pre-input").val();
        mon.conPoints = $("#con-input").val();
        mon.intPoints = $("#int-input").val();
        mon.insPoints = $("#ins-input").val();
        mon.chaPoints = $("#cha-input").val();
        mon.affPoints = $("#aff-input").val();
        mon.wilPoints = $("#wil-input").val();

        // Senses
        mon.blindsight = $("#blindsight-input").val();
        mon.blind = $("#blindness-input").prop("checked");
        mon.lowlightvision = $("#lowlightvision-input").val();
        mon.darkvision = $("#darkvision-input").val();
        mon.tremorsense = $("#tremorsense-input").val();
        mon.truesight = $("#truesight-input").val();

        // Language
        mon.understandsBut = $("#understands-but-input").val();
        mon.telepathy = parseInt($("#telepathy-input").val());

        // Challenge Rating
        mon.cr = $("#cr-input").val();

        // Shortened Name
        mon.shortName = $("#short-name-input").val();

        // Legendaries
        mon.isLegendary = $("#is-legendary-input").prop("checked");
        if (mon.isLegendary)
            mon.legendariesDescription = $("#legendaries-descsection-input").val().trim();

        // Lair
        mon.isLair = $("#has-lair-input").prop("checked");
        if (mon.isLair) {
            mon.lairDescription = $("#lair-descsection-input").val().trim();
            mon.lairDescriptionEnd = $("#lair-end-descsection-input").val().trim();
        }

        // Regional
        mon.isRegional = $("#has-regional-input").prop("checked");
        if (mon.isRegional) {
            mon.regionalDescription = $("#regional-descsection-input").val().trim();
            mon.regionalDescriptionEnd = $("#regional-end-descsection-input").val().trim();
        }

        // One or two columns ?
        mon.doubleColumns = $("#2col-input").prop("checked");
    },

    // Get all variables from preset
    SetPreset: function (preset) {
        // Name and type
        mon.name = preset.name.trim();
        mon.size = preset.size;
        mon.type = preset.type.trim();
        mon.tag = preset.subtype.trim();
        mon.alignment = preset.alignment.trim();

        // Stats
        mon.strPoints = preset.strength;
        mon.agiPoints = preset.agility;
        mon.prePoints = preset.precision;
        mon.conPoints = preset.constitution;
        mon.intPoints = preset.intelligence;
        mon.insPoints = preset.insight;
        mon.chaPoints = preset.charisma;
        mon.affPoints = preset.affinity;
        mon.wilPoints = preset.willpower;

        // CR
        mon.cr = preset.challenge_rating;

        // HP & Armor
        mon.armor = preset.armor;
        mon.customHP = preset.customHP;
        mon.customResolve = preset.customResolve;

        // Initiative
        mon.customInitiative = preset.customInitiative;
        mon.initiativeDie = preset.initiativeDie;

        // Speeds
        let GetSpeed = (speedList, speedType) => speedList.hasOwnProperty(speedType) ? parseInt(speedList[speedType]) : 0;

        mon.speed = GetSpeed(preset.speed, "walk");
        mon.burrowSpeed = GetSpeed(preset.speed, "burrow");
        mon.climbSpeed = GetSpeed(preset.speed, "climb");
        mon.flySpeed = GetSpeed(preset.speed, "fly");
        mon.swimSpeed = GetSpeed(preset.speed, "swim");
        mon.hover = preset.speed.hasOwnProperty("hover");

        if (preset.speed.hasOwnProperty("notes")) {
            mon.customSpeed = true;
            mon.speedDesc = preset.speed.walk + " m. (" + preset.speed.notes + ")";
        } else {
            mon.customSpeed = false;
            mon.speedDesc = StringFunctions.GetSpeed();
        }

        // Skills
        mon.skills = [];
        if (preset.skills) {
            for (let index = 0; index < data.allSkills.length; index++) {
                let currentSkill = data.allSkills[index],
                    skillCheck = StringFunctions.StringReplaceAll(currentSkill.name.toLowerCase(), " ", "_");
                if (preset.skills[skillCheck]) {
                    let expectedExpertise = MathFunctions.PointsToBonus(mon[currentSkill.stat + "Points"]),
                        skillVal = preset.skills[skillCheck];
                    this.AddSkill(data.allSkills[index].name, (skillVal >= expectedExpertise ? " (ex)" : null));
                }
            }
        }

        // Conditions
        mon.conditions = [];
        let conditionsPresetArr = ArrayFunctions.FixPresetArray(preset.condition_immunities);
        for (let index = 0; index < conditionsPresetArr.length; index++)
            this.AddCondition(conditionsPresetArr[index]);

        // Damage Types
        mon.damagetypes = [];
        mon.specialdamage = [];
        this.AddPresetDamage(preset.damage_vulnerabilities, "v");
        this.AddPresetDamage(preset.damage_resistances, "r");
        this.AddPresetDamage(preset.damage_immunities, "i");

        // Languages
        mon.languages = [];
        mon.telepathy = 0;
        mon.understandsBut = "";
        if (preset.languages.includes("understands")) {
            let speaksUnderstandsArr = preset.languages.split("understands"),
                speaks = speaksUnderstandsArr[0].length > 0 ? speaksUnderstandsArr[0].trim().split(",") : [],
                understands = speaksUnderstandsArr[1].split(" but "),
                understandsLangs = understands[0].replace(", and ", ",").replace(" and ", ",").split(","),
                understandsBut = understands[1].trim();

            for (let index = 0; index < speaks.length; index++)
                this.AddLanguage(speaks[index], true);
            for (let index = 0; index < understandsLangs.length; index++)
                this.AddLanguage(understandsLangs[index], false);

            if (understandsBut.toLowerCase().includes("telepathy")) {
                mon.telepathy = parseInt(understandsBut.replace(/\D/g, ''));
                understandsBut = understandsBut.substr(0, understandsBut.lastIndexOf(","));
            }
            mon.understandsBut = understandsBut;
        }
        else {
            let languagesPresetArr = preset.languages.split(",");
            for (let index = 0; index < languagesPresetArr.length; index++) {
                let languageName = languagesPresetArr[index].trim();
                languageName.toLowerCase().includes("telepathy") ?
                    mon.telepathy = parseInt(languageName.replace(/\D/g, '')) :
                    this.AddLanguage(languageName, true);
            }
        }

        // Senses
        mon.blindsight = 0;
        mon.blind = false;
        mon.lowlightvision = 0;
        mon.darkvision = 0;
        mon.tremorsense = 0;
        mon.truesight = 0;
        let sensesPresetArr = preset.senses.split(",");
        for (let index = 0; index < sensesPresetArr.length; index++) {
            let senseString = sensesPresetArr[index].trim().toLowerCase(),
                senseName = senseString.split(" ")[0],
                senseDist = StringFunctions.GetNumbersOnly(senseString);
            switch (senseName) {
                case "blindsight":
                    mon.blindsight = senseDist;
                    mon.blind = senseString.toLowerCase().includes("blind beyond");
                    break;
                case "lowlightvision":
                    mon.lowlightvision = senseDist;
                    break;
                case "darkvision":
                    mon.darkvision = senseDist;
                    break;
                case "tremorsense":
                    mon.tremorsense = senseDist;
                    break;
                case "truesight":
                    mon.truesight = senseDist;
                    break;
            }
        }

        // Legendary?
        mon.isLegendary = Array.isArray(preset.legendary_actions);
        if (preset.legendary_desc == null || preset.legendary_desc.length == 0)
            this.LegendaryDescriptionDefault();
        else
            mon.legendariesDescription = preset.legendary_desc;
        FormFunctions.SetLegendaryDescriptionForm();

        // Lair?
        mon.isLair = Array.isArray(preset.lair_actions);
        if (preset.lair_desc == null || preset.lair_desc.length == 0) {
            this.LairDescriptionDefault();
            this.LairDescriptionEndDefault();
        }
        else {
            mon.lairDescription = preset.lair_desc;
            mon.lairDescriptionEnd = preset.lair_desc_end;
        }
        FormFunctions.SetLairDescriptionForm();

        // Regional Effects?
        mon.isRegional = Array.isArray(preset.regional_actions);
        if (preset.regional_desc == null || preset.regional_desc.length == 0) {
            this.RegionalDescriptionDefault();
            this.RegionalDescriptionEndDefault();
        }
        else {
            mon.regionalDescription = preset.regional_desc;
            mon.regionalDescriptionEnd = preset.regional_desc_end;
        }
        FormFunctions.SetRegionalDescriptionForm();
        FormFunctions.SetRegionalDescriptionEndForm();

        // Abilities
        mon.abilities = [];
        mon.actions = [];
        mon.reactions = [];
        mon.legendaries = [];
        mon.lairs = [];
        mon.regionals = [];
        let abilitiesPresetArr = preset.special_abilities,
            actionsPresetArr = preset.actions,
            reactionsPresetArr = preset.reactions,
            legendariesPresetArr = preset.legendary_actions,
            lairsPresetArr = preset.lair_actions,
            regionalsPresetArr = preset.regional_actions;

        let self = this,
            AbilityPresetLoop = function (arr, name) {
                if (Array.isArray(arr)) {
                    for (let index = 0; index < arr.length; index++)
                        self.AddAbilityPreset(name, arr[index]);
                }
            }

        AbilityPresetLoop(abilitiesPresetArr, "abilities");
        AbilityPresetLoop(actionsPresetArr, "actions");
        AbilityPresetLoop(reactionsPresetArr, "reactions");
        if (mon.isLegendary)
            AbilityPresetLoop(legendariesPresetArr, "legendaries");
        if (mon.isLair)
            AbilityPresetLoop(lairsPresetArr, "lairs");
        if (mon.isRegional)
            AbilityPresetLoop(regionalsPresetArr, "regionals");

        mon.separationPoint = undefined; // This will make the separation point be automatically calculated in UpdateStatblock
    },

    // Add stuff to arrays

    AddSthrow: function (sthrowName) {
        if (!sthrowName) return;
        let sthrowData = ArrayFunctions.FindInList(data.stats, sthrowName),
            inserted = false;
        if (sthrowData == null) return;

        // Non-alphabetical ordering
        for (let index = 0; index < mon.sthrows.length; index++) {
            if (mon.sthrows[index].name == sthrowName) return;
            if (mon.sthrows[index].order > sthrowData.order) {
                mon.sthrows.splice(index, 0, sthrowData)
                inserted = true;
                break;
            }
        }
        if (!inserted)
            mon.sthrows.push(sthrowData);
    },

    AddSkill: function (skillName, value) {
        let skill = {
            "name": skillName,
            "value": value
        };
        ArrayFunctions.ArrayInsert(mon.skills, skill, true);
    },

    AddDamageType: function (damageName, type) {
        let special = false,
            note;
        if (!data.allNormalDamageTypes.includes(damageName.toLowerCase())) {
            special = true;
            if (damageName == "*") {
                damageName = $("#other-damage-input").val().trim();
                if (damageName.length == 0)
                    return;
            }
        }
        note = type == 'v' ? " (Vulnerable)" : type == 'i' ? " (Immune)" : " (Resistant)";
        ArrayFunctions.ArrayInsert(mon[special ? "specialdamage" : "damagetypes"], {
            "name": damageName,
            "note": note,
            "type": type
        }, true);
    },

    AddPresetDamage: function (string, type) {
        if (string.length == 0) return;
        let arr = string.split(";");
        if (arr[0].toLowerCase().includes("magic"))
            this.AddDamageType(arr[0].trim(), type);
        else {
            let normalArr = arr[0].split(",");
            for (let index = 0; index < normalArr.length; index++)
                this.AddDamageType(normalArr[index].trim(), type);
            for (let index = 1; index < arr.length; index++)
                this.AddDamageType(arr[index].trim(), type);
        }
    },

    AddCondition: function (conditionName) {
        ArrayFunctions.ArrayInsert(mon.conditions, {
            "name": conditionName
        }, true);
    },

    AddLanguage: function (languageName, speaks) {
        if (languageName == "") return;
        if (languageName == "*") {
            languageName = $("#other-language-input").val().trim();
            if (languageName.length == 0) return;
        }
        if (mon.languages.length > 0) {
            if (languageName.toLowerCase() == "all" || mon.languages[0].name.toLowerCase() == "all")
                mon.languages = [];
        }
        ArrayFunctions.ArrayInsert(mon.languages, {
            "name": languageName.trim(),
            "speaks": speaks
        }, true);
    },


    // Add abilities, actions, reactions, and legendary actions

    AddAbility: function (arrName, abilityName, abilityDesc) {
        let arr = mon[arrName];
        ArrayFunctions.ArrayInsert(arr, {
            "name": abilityName.trim(),
            "desc": abilityDesc.trim()
        }, false);
    },

    AddAbilityPreset: function (arrName, ability) {
        let abilityName = ability.name.trim(),
            abilityDesc = ability.desc;
        if (Array.isArray(abilityDesc))
            abilityDesc = abilityDesc.join("\n");
        abilityDesc = abilityDesc.trim();

        // In case of spellcasting
        if (arrName == "abilities" && abilityName.toLowerCase().includes("spellcasting") && abilityDesc.includes("\n")) {
            abilityDesc = abilityDesc.split("\u2022").join(""), // Remove bullet points
                spellcastingAbility =
                abilityDesc.toLowerCase().includes("intelligence") ? "INT" :
                    abilityDesc.toLowerCase().includes("wisdom") ? "WIS" :
                        abilityDesc.toLowerCase().includes("charisma") ? "CHA" : null;

            if (spellcastingAbility != null) {
                abilityDesc = abilityDesc
                    .replace(/DC \d+/g.exec(abilityDesc), "DC [" + spellcastingAbility + " SAVE]")
                    .replace(/[\+\-]\d+ to hit/g.exec(abilityDesc), "[" + spellcastingAbility + " ATK] to hit");
            }

            // For hag covens
            let postDesc = "";
            if (abilityName.toLowerCase().includes("shared spellcasting")) {
                let lastLineBreak = abilityDesc.lastIndexOf("\n\n");
                postDesc = abilityDesc.substr(lastLineBreak).trim();
                abilityDesc = abilityDesc.substring(0, lastLineBreak);
            }

            let firstLineBreak = abilityDesc.indexOf("\n");
            spellcastingDesc = abilityDesc.substr(0, firstLineBreak).trim();
            spellcastingSpells = abilityDesc.substr(firstLineBreak).trim();

            spellsArr = spellcastingSpells.split("\n");
            for (let index = 0; index < spellsArr.length; index++) {
                let string = spellsArr[index],
                    splitString = string.split(":");
                if (splitString.length < 2) continue;
                let newString = splitString[1];
                newString = StringFunctions.StringReplaceAll(newString, "(", "_(");
                newString = StringFunctions.StringReplaceAll(newString, ")", ")_");

                spellsArr[index] = " " + splitString[0].trim() + ": _" + newString.trim() + "_";
            }

            spellcastingSpells = spellsArr.join("\n>");

            abilityDesc = spellcastingDesc + "\n\n\n>" + spellcastingSpells;

            // For hag covens
            if (postDesc.length > 0)
                abilityDesc += "\n\n" + postDesc;
        }

        // In case of attacks
        if (arrName == "actions" && abilityDesc.toLowerCase().includes("attack")) {
            // Italicize the correct parts of attack-type actions
            let lowercaseDesc = abilityDesc.toLowerCase();
            for (let index = 0; index < data.attackTypes.length; index++) {
                let attackType = data.attackTypes[index];
                if (lowercaseDesc.includes(attackType)) {
                    let indexOfStart = lowercaseDesc.indexOf(attackType),
                        indexOfHit = lowercaseDesc.indexOf("hit:");
                    if (indexOfStart != 0) break;
                    abilityDesc = "_" + abilityDesc.slice(0, attackType.length) + "_" + abilityDesc.slice(attackType.length, indexOfHit) + "_" + abilityDesc.slice(indexOfHit, indexOfHit + 4) + "_" + abilityDesc.slice(indexOfHit + 4);
                    break;
                }
            }
        }

        if (abilityName.length != 0 && abilityDesc.length != 0)
            this.AddAbility(arrName, abilityName, abilityDesc);
    },

    // Return the default legendary description
    LegendaryDescriptionDefault: function () {
        let monsterName = name.toLowerCase();
        mon.legendariesDescription = "The " + mon.name.toLowerCase() + " can take 3 legendary actions, choosing from the options below. Only one legendary action option can be used at a time and only at the end of another creature's turn. The " + mon.name.toLowerCase() + " regains spent legendary actions at the start of its turn.";
    },

    // Return the default lair description
    LairDescriptionDefault: function () {
        let monsterName = name.toLowerCase();
        mon.lairDescription = "When fighting inside its lair, the " + mon.name.toLowerCase() + " can invoke the ambient magic to take lair actions. On initiative count 20 (losing initiative ties), the " + mon.name.toLowerCase() + " can take one lair action to cause one of the following effects:";
    },

    // Return the default lair end description
    LairDescriptionEndDefault: function () {
        let monsterName = name.toLowerCase();
        mon.lairDescriptionEnd = "The " + mon.name.toLowerCase() + " can't repeat an effect until they have all been used, and it can't use the same effect two rounds in a row.";
    },

    // Return the default regional description
    RegionalDescriptionDefault: function () {
        let monsterName = name.toLowerCase();
        mon.regionalDescription = "The region containing the " + mon.name.toLowerCase() + "'s lair is warped by the creature's presence, which creates one or more of the following effects:";
    },

    // Return the default regional end description
    RegionalDescriptionEndDefault: function () {
        let monsterName = name.toLowerCase();
        mon.regionalDescriptionEnd = "If the " + mon.name.toLowerCase() + " dies, the first two effects fade over the course of 3d10 days.";
    }
}

// Functions that return a string
var StringFunctions = {
    // Add a + if the ability bonus is non-negative
    BonusFormat: (stat) => stat >= 0 ? "+" + stat : stat,

    // Get the string displayed for the monster's AC
    GetArmorData: function () {
        return mon.armor;
    },

    // Get the string displayed for the monster's HP
    GetHP: function () {
        if (mon.customHP)
            return mon.customHP;
        return (2 * parseInt(MathFunctions.PointsToBonus(mon.conPoints))) + parseInt(mon.size);
    },

    // Get the string displayed for the monster's HP
    GetResolve: function () {
        if (mon.customResolve)
            return mon.customResolve;
        return MathFunctions.PointsToBonus(mon.wilPoints) * 4;
    },

    GetInitiative: function () {
        if (mon.customInitiative)
            return mon.customInitiative;
        return 26 - ((parseInt(MathFunctions.PointsToBonus(mon.insPoints)) + parseInt(MathFunctions.PointsToBonus(mon.agiPoints))) / 2)
    },

    GetInitiativeDie: function () {
        return mon.initiativeDie;
    },

    GetSpeed: function () {
        if (mon.customSpeed)
            return mon.speedDesc;
        let speedsDisplayArr = [mon.speed + " m."];
        if (mon.burrowSpeed > 0) speedsDisplayArr.push("burrow " + mon.burrowSpeed + " m.");
        if (mon.climbSpeed > 0) speedsDisplayArr.push("climb " + mon.climbSpeed + " m.");
        if (mon.flySpeed > 0) speedsDisplayArr.push("fly " + mon.flySpeed + " m." + (mon.hover ? " (hover)" : ""));
        if (mon.swimSpeed > 0) speedsDisplayArr.push("swim " + mon.swimSpeed + " m.");
        return speedsDisplayArr.join(", ")
    },

    GetSenses: function () {
        let sensesDisplayArr = [];
        if (mon.blindsight > 0) sensesDisplayArr.push("blindsight " + mon.blindsight + " m." + (mon.blind ? " (blind beyond this radius)" : ""));
        if (mon.lowlightvision > 0) sensesDisplayArr.push('lowlightvision ' + mon.lowlightvision + " m.");
        if (mon.darkvision > 0) sensesDisplayArr.push("darkvision " + mon.darkvision + " m.");
        if (mon.tremorsense > 0) sensesDisplayArr.push("tremorsense " + mon.tremorsense + " m.");
        if (mon.truesight > 0) sensesDisplayArr.push("truesight " + mon.truesight + " m.");
        return sensesDisplayArr.join(", ");
    },

    GetPropertiesDisplayArr: function () {
        // Properties
        let propertiesDisplayArr = [],
            skillsDisplayArr = [],
            conditionsDisplayArr = [],
            languageDisplayArr = [],
            vulnerableDisplayString = "",
            resistantDisplayString = "",
            immuneDisplayString = "";

        // Skills
        for (let index = 0; index < mon.skills.length; index++) {
            let skillData = mon.skills[index];
            skillsDisplayArr.push(StringFunctions.StringCapitalize(skillData.name) + " (" + skillData.value + ")");
        }

        // Damage Types (It's not pretty but it does its job)
        let vulnerableDisplayArr = [],
            resistantDisplayArr = [],
            immuneDisplayArr = [],
            vulnerableDisplayArrSpecial = [],
            resistantDisplayArrSpecial = [],
            immuneDisplayArrSpecial = [];
        for (let index = 0; index < mon.damagetypes.length; index++) {
            let typeId = mon.damagetypes[index].type;
            (typeId == "v" ? vulnerableDisplayArr : typeId == "i" ? immuneDisplayArr : resistantDisplayArr).push(mon.damagetypes[index].name)
        }
        for (let index = 0; index < mon.specialdamage.length; index++) {
            let typeId = mon.specialdamage[index].type,
                arr = typeId == "v" ? vulnerableDisplayArrSpecial : typeId == "i" ? immuneDisplayArrSpecial : resistantDisplayArrSpecial;
            arr.push(mon.specialdamage[index].name)
        }
        vulnerableDisplayString = StringFunctions.ConcatUnlessEmpty(vulnerableDisplayArr.join(", "), vulnerableDisplayArrSpecial.join("; "), "; ").toLowerCase();
        resistantDisplayString = StringFunctions.ConcatUnlessEmpty(resistantDisplayArr.join(", "), resistantDisplayArrSpecial.join("; "), "; ").toLowerCase();
        immuneDisplayString = StringFunctions.ConcatUnlessEmpty(immuneDisplayArr.join(", "), immuneDisplayArrSpecial.join("; "), "; ").toLowerCase();

        // Condition Immunities
        for (let index = 0; index < mon.conditions.length; index++)
            conditionsDisplayArr.push(mon.conditions[index].name.toLowerCase());

        // Senses
        sensesDisplayString = StringFunctions.GetSenses();

        // Languages
        let speaksLanguages = [], understandsLanguages = [];
        for (let index = 0; index < mon.languages.length; index++) {
            let language = mon.languages[index];
            if (language.speaks || language.speaks == undefined)
                speaksLanguages.push(language);
            else
                understandsLanguages.push(language);
        }
        for (let index = 0; index < speaksLanguages.length; index++)
            languageDisplayArr.push(speaksLanguages[index].name);

        if (understandsLanguages.length > 0) {
            if (understandsLanguages.length > 1) {
                if (understandsLanguages.length > 2) {
                    languageDisplayArr.push("understands " + understandsLanguages[0].name);
                    for (let index = 1; index < understandsLanguages.length; index++)
                        languageDisplayArr.push(understandsLanguages[index].name);
                    languageDisplayArr[languageDisplayArr.length - 1] = " and " + languageDisplayArr[languageDisplayArr.length - 1];
                }
                else
                    languageDisplayArr.push("understands " + understandsLanguages[0].name + " and " + understandsLanguages[1].name);
            }
            else
                languageDisplayArr.push("understands " + understandsLanguages[0].name);
            if (mon.understandsBut && mon.understandsBut.trim().length > 0)
                languageDisplayArr[languageDisplayArr.length - 1] += " but " + mon.understandsBut.trim();
        }

        if (mon.telepathy > 0)
            languageDisplayArr.push("telepathy " + mon.telepathy + " m.");
        else if (languageDisplayArr.length == 0)
            languageDisplayArr.push("&mdash;");

        // Add all that to the array
        let pushArr = (name, arr) => {
            if (arr.length > 0) propertiesDisplayArr.push({
                "name": name,
                "arr": arr
            })
        };
        pushArr("Skills", skillsDisplayArr);
        pushArr("Damage Vulnerabilities", vulnerableDisplayString);
        pushArr("Damage Resistances", resistantDisplayString);
        pushArr("Damage Immunities", immuneDisplayString);
        pushArr("Condition Immunities", conditionsDisplayArr);
        pushArr("Senses", sensesDisplayString);
        pushArr("Languages", languageDisplayArr);

        return propertiesDisplayArr;
    },

    // Add italics, indents, and newlines
    FormatString: function (string, isBlock) {
        if (typeof string != "string")
            return string;

        // Complicated regex stuff to add indents
        if (isBlock) {
            let execArr, newlineArr = [],
                regExp = new RegExp("(\r\n|\r|\n)+", "g");
            while ((execArr = regExp.exec(string)) !== null)
                newlineArr.push(execArr);
            let index = newlineArr.length - 1;
            while (index >= 0) {
                let newlineString = newlineArr[index],
                    reverseIndent = (string[newlineString.index + newlineString[0].length] == ">");

                string = this.StringSplice(string, newlineString.index, newlineString[0].length + (reverseIndent ? 1 : 0),
                    "</div>" + (newlineString[0].length > 1 ? "<br>" : "") + (reverseIndent ? "<div class='reverse-indent'>" : "<div class='indent'>"));

                index--;
            }
        }

        // Italics and bold
        string = this.FormatStringHelper(string, "_", "<i>", "</i>")
        string = this.FormatStringHelper(string, "**", "<b>", "</b>")
        return string;
    },

    // FormatString helper function
    FormatStringHelper: function (string, target, startTag, endTag) {
        while (string.includes(target)) {
            let startIndex = string.indexOf(target);
            string = this.StringSplice(string, startIndex, target.length, startTag);
            let endIndex = string.indexOf(target, startIndex + target.length);
            if (endIndex < 0)
                return string + endTag;
            string = this.StringSplice(string, endIndex, target.length, endTag);
        }
        return string;
    },

    // HTML strings

    MakePropertyHTML: function (property, firstLine) {
        if (property.arr.length == 0) return "";
        let htmlClass = firstLine ? "property-line first" : "property-line",
            arr = Array.isArray(property.arr) ? property.arr.join(", ") : property.arr;
        return "<div class=\"" + htmlClass + "\"><div><h4>" + StringFunctions.RemoveHtmlTags(property.name) + "</h4> <p>" + StringFunctions.RemoveHtmlTags(this.FormatString(arr, false)) + "</p></div></div><!-- property line -->"
    },

    MakeTraitHTML: function (name, description) {
        return "<div class=\"property-block\"><div><h4>" + StringFunctions.RemoveHtmlTags(name) + ".</h4><p> " + this.FormatString(StringFunctions.RemoveHtmlTags(description), true) + "</p></div></div> <!-- property block -->";
    },

    MakeTraitHTMLLegendary: function (name, description) {
        return "<div class=\"property-block reverse-indent legendary\"><div><h4>" + StringFunctions.RemoveHtmlTags(name) + ".</h4><p> " + this.FormatString(StringFunctions.RemoveHtmlTags(description), true) + "</p></div></div> <!-- property block -->";
    },

    MakeTraitHTMLLairRegional: function (name, description) {
        return "<div class=\"property-block lairregional\"><div><li>" + this.FormatString(StringFunctions.RemoveHtmlTags(description), true) + "</li></div></div> <!-- property block -->";
    },

    // General string operations

    ConcatUnlessEmpty(item1, item2, joinString = ", ") {
        return item1.length > 0 ?
            item2.length > 0 ? item1 + joinString + item2 :
                item1 : item2.length > 0 ? item2 : "";
    },

    StringSplice: (string, index, remove, insert = "") => string.slice(0, index) + insert + string.slice(index + remove),

    StringReplaceAll: (string, find, replacement) => string.split(find).join(replacement),

    StringCapitalize: (string) => string[0].toUpperCase() + string.substr(1),

    GetNumbersOnly: (string) => parseInt(string.replace(/\D/g, '')),

    RemoveHtmlTags(string) {
        if (typeof (string) != "string")
            return string;
        return StringFunctions.StringReplaceAll(string, '<', "&lt;")
    }
}

// Math functions
var MathFunctions = {
    Clamp: (num, min, max) => Math.min(Math.max(num, min), max),

    // Compute ability bonuses based on ability scores
    PointsToBonus: (points) => points,
}

// Array functions
var ArrayFunctions = {
    ArrayInsert: function (arr, element, alphabetSort) {
        let lowercaseElement = element.name.toLowerCase();
        for (let index = 0; index < arr.length; index++) {
            let lowercaseIndex = arr[index].name.toLowerCase();
            if (alphabetSort && lowercaseIndex > lowercaseElement) {
                arr.splice(index, 0, element)
                return;
            }
            if (lowercaseIndex == lowercaseElement) {
                arr.splice(index, 1, element)
                return;
            }
        }
        arr.push(element);
    },

    FindInList: function (arr, name) {
        let lowercaseName = name.toLowerCase();
        for (let index = 0; index < arr.length; index++) {
            if (arr[index].name.toLowerCase() == lowercaseName)
                return arr[index];
        }
        return null;
    },

    // Take a string representing an array from a preset and turn it into a normal array
    FixPresetArray: function (string) {
        let arr = string.split(","),
            returnArr = [];
        for (let index = 0; index < arr.length; index++) {
            let name = arr[index].trim();
            if (name.length > 0)
                returnArr.push(name);
        }
        return returnArr;
    }
}

// Document ready function
$(function () {
    // Load the preset monster names
    /* $.getJSON("https://api.open5e.com/monsters/?format=json&fields=slug,name&limit=1000&document__slug=wotc-srd", function (srdArr) {
        let monsterSelect = $("#monster-select");
        monsterSelect.append("<option value=''></option>");
        monsterSelect.append("<option value=''>-5e SRD-</option>");
        $.each(srdArr.results, function (index, value) {
            monsterSelect.append("<option value='" + value.slug + "'>" + value.name + "</option>");
        })
        $.getJSON("https://api.open5e.com/monsters/?format=json&fields=slug,name&limit=1000&document__slug=tob", function (tobArr) {
            monsterSelect.append("<option value=''></option>");
            monsterSelect.append("<option value=''>-Tome of Beasts (Kobold Press)-</option>");
            $.each(tobArr.results, function (index, value) {
                monsterSelect.append("<option value='" + value.slug + "'>" + value.name + "</option>");
            })
        })
            .fail(function () {
                $("#monster-select-form").html("Unable to load Tome of Beasts monster presets.")
            });
    })
        .fail(function () { */
            $("#monster-select-form").html("Unable to load monster presets.")
        // });

    // Load the json data
    $.getJSON("js/JSON/statblockdata.json", function (json) {
        data = json;

        // Set the default monster in case there isn't one saved
        GetVariablesFunctions.SetPreset(data.defaultPreset);

        // Load saved data
        SavedData.RetrieveFromLocalStorage();

        Populate();
    });

    FormFunctions.ShowHideFormatHelper();
});

function Populate() {
    FormFunctions.SetLegendaryDescriptionForm();
    FormFunctions.SetLairDescriptionForm();
    FormFunctions.SetLairDescriptionEndForm();
    FormFunctions.SetRegionalDescriptionForm();
    FormFunctions.SetRegionalDescriptionEndForm();
    FormFunctions.SetCommonAbilitiesDropdown();

    // Populate the stat block
    FormFunctions.InitForms();
    FormFunctions.SetForms();
    UpdateStatblock();
}

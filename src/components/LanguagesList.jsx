import React from "react";
import languageColorsData from "../utils/languageColors";

const LanguagesList = ({ languages }) => (
    <div className="flex flex-wrap gap-3">
        {languages.length > 0 ? (
            languages.map((lang) => (
                <span
                    key={lang}
                    className="px-3 py-1 rounded-full text-xs font-medium"
                    style={{
                        backgroundColor: languageColorsData[lang] || languageColorsData.Other,
                        color: "#fff",
                    }}
                >
                    {lang}
                </span>
            ))
        ) : (
            <p className="text-gray-500">Нет данных о языках.</p>
        )}
    </div>
);

export default LanguagesList;
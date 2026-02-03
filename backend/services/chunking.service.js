const { RecursiveCharacterTextSplitter } = require("@langchain/textsplitters");
const { ClientError } = require("./../services/error.service");
const { CHUNK_SIZE, CHUNK_OVERLAP } = require("../configs/constants.config");

/*
    @desc    Split text into chunks using RecursiveCharacterTextSplitter
    @param   {string} text 
    @returns {Promise<string[]>}
*/

async function splitTextIntoChunks(text) {
    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: CHUNK_SIZE,
        chunkOverlap: CHUNK_OVERLAP,
        separators: [],
        keepSeparator: true,
    });

    const textChunks = await splitter.splitText(text);
    return textChunks;
}

/*
    @desc    Splits page text into chunks with metadata
    @param   {Array<{pageNumber: number, text: string}>} pages
    @returns {Promise<Array<{chunkIndex: number, text: string, pageNumber: number}>>}
*/

exports.createChunks = async function (pages) {
    try {
        let res = [];
        for (const { pageNumber, text } of pages) {
            const cleanedText = text
                .replace(/\n(?!\n)/g, " ") // Single \n becomes space
                .replace(/\n{2,}/g, "\n\n") // Multiple \n becomes exactly \n\n
                .replace(/ {2,}/g, " ") // Multiple spaces become single space
                .trim();
            if (!text) continue;
            const chunks = await splitTextIntoChunks(cleanedText);
            const mappedChunks = chunks.map(function (chunk, index) {
                return {
                    chunkIndex: index,
                    text: chunk,
                    pageNumber: pageNumber,
                };
            });
            res = res.concat(mappedChunks);
        }

        return res;
    } catch (error) {
        throw new Error("chunkingErr :", error.message);
    }
};

/*
[
  {
    chunkIndex: 0,
    text: 'Word1 Word2 Word3 Word4 Word5 Word6 Word7 Word8 Word9 Word10 Word11 Word12 Word13 Word14 Word15 Word16 Word17 Word18 Word19 Word20 Word21 Word22 Word23 Word24 Word25 Word26 Word27 Word28 Word29 Word30 Word31 Word32 Word33 Word34 Word35 Word36 Word37 Word38 Word39 Word40 Word41 Word42 Word43 Word44 Word45 Word46 Word47 Word48 Word49 Word50 Word51 Word52 Word53 Word54 Word55 Word56 Word57 Word58 Word59 Word60 Word61 Word62 Word63 Word64 Word65 Word66 Word67 Word68 Word69 Word70 Word71 Word72 Word73 Word74 Word75 Word76 Word77 Word78 Word79 Word80 Word81 Word82 Word83 Word84 Word85 Word86 Word87 Word88 Word89 Word90 Word91 Word92 Word93 Word94 Word95 Word96 Word97 Word98 Word99 Word100 Word101 Word102 Word103 Word104 Word105 Word106 Word107 Word108 Word109 Word110 Word111 Word112 Word113 Word114 Word115 Word116 Word117 Word118 Word119 Word120 Word121 Word122 Word123 Word124 Word125 Word126 Word127 Word128 Word129 Word130 Word131 Word132 Word133 Word134 Word135 Word136 Word137 Word138 Word',
    pageNumber: 1
  },
  {
    chunkIndex: 1,
    text: '114 Word115 Word116 Word117 Word118 Word119 Word120 Word121 Word122 Word123 Word124 Word125 Word126 Word127 Word128 Word129 Word130 Word131 Word132 Word133 Word134 Word135 Word136 Word137 Word138 Word139 Word140 Word141 Word142 Word143 Word144 Word145 Word146 Word147 Word148 Word149 Word150 Word151 Word152 Word153 Word154 Word155 Word156 Word157 Word158 Word159 Word160 Word161 Word162 Word163',
    pageNumber: 1
  },
  {
    chunkIndex: 0,
    text: 'Word164 Word165 Word166 Word167 Word168 Word169 Word170 Word171 Word172 Word173 Word174 Word175 Word176 Word177 Word178 Word179 Word180 Word181 Word182 Word183 Word184 Word185 Word186 Word187 Word188 Word189 Word190 Word191 Word192 Word193 Word194 Word195 Word196 Word197 Word198 Word199 Word200 Word201 Word202 Word203 Word204 Word205 Word206 Word207 Word208 Word209 Word210 Word211 Word212 Word213 Word214 Word215 Word216 Word217 Word218 Word219 Word220 Word221 Word222 Word223 Word224 Word225 Word226 Word227 Word228 Word229 Word230 Word231 Word232 Word233 Word234 Word235 Word236 Word237 Word238 Word239 Word240 Word241 Word242 Word243 Word244 Word245 Word246 Word247 Word248 Word249 Word250 Word251 Word252 Word253 Word254 Word255 Word256 Word257 Word258 Word259 Word260 Word261 Word262 Word263 Word264 Word265 Word266 Word267 Word268 Word269 Word270 Word271 Word272 Word273 Word274 Word275 Word276 Word277 Word278 Word279 Word280 Word281 Word282 Word283 Word284 Word285 Word286 Word287 Word288',
    pageNumber: 3
  },
  {
    chunkIndex: 1,
    text: 'Word264 Word265 Word266 Word267 Word268 Word269 Word270 Word271 Word272 Word273 Word274 Word275 Word276 Word277 Word278 Word279 Word280 Word281 Word282 Word283 Word284 Word285 Word286 Word287 Word288 Word289 Word290 Word291 Word292 Word293 Word294 Word295 Word296 Word297 Word298 Word299 Word300 Word301 Word302 Word303 Word304 Word305 Word306 Word307 Word308 Word309 Word310 Word311 Word312 Word313 Word314 Word315 Word316 Word317 Word318 Word319 Word320 Word321 Word322 Word323 Word324 Word325 Word326 Word327 Word328 Word329 Word330 Word331 Word332 Word333 Word334 Word335 Word336 Word337 Word338 Word339 Word340 Word341 Word342 Word343 Word344 Word345 Word346 Word347 Word348',
    pageNumber: 3
  },
  {
    chunkIndex: 0,
    text: 'Word349 Word350 Word351 Word352 Word353 Word354 Word355 Word356 Word357 Word358 Word359 Word360 Word361 Word362 Word363 Word364 Word365 Word366 Word367 Word368 Word369 Word370 Word371 Word372 Word373 Word374 Word375 Word376 Word377 Word378 Word379 Word380 Word381 Word382 Word383 Word384 Word385 Word386 Word387 Word388 Word389 Word390 Word391 Word392 Word393 Word394 Word395 Word396 Word397 Word398 Word399 Word400',
    pageNumber: 4
  }
]
 */

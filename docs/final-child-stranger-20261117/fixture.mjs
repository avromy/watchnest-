var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
export var profiles = ["Miri", "Ari", "Benny", "Eli"].map(function (display_name, i) { return ({
    id: "00000000-0000-4000-8000-00000000000".concat(i + 1),
    display_name: display_name,
    avatar_key: ["bird", "fox", "bear", "rocket"][i],
    color_key: ["mint", "yellow", "blue", "coral"][i],
    experience_mode: "standard",
    pin_enabled: i < 2,
    photo_url: null,
    available_from_minute: null,
    available_until_minute: null,
}); });
export var videos = [
    ["Build a paper rocket", "Little Makers", "crafts"],
    ["A gentle piano lesson", "Music Room", "music"],
    ["Draw a friendly fox", "Little Makers", "drawing"],
].map(function (_a, i) {
    var title = _a[0], channel_title = _a[1], tag = _a[2];
    return ({
        id: "10000000-0000-4000-8000-00000000000".concat(i + 1),
        youtube_video_id: ["abcdefghijk", "lmnopqrstuv", "zyxwvutsrqp"][i],
        title: title,
        channel_title: channel_title,
        thumbnail_url: "",
        duration_seconds: 180 + i * 60,
        tags: [tag],
        made_for_kids: i === 0 ? false : true,
        profile_ids: [profiles[1].id],
        added_at: new Date().toISOString(),
        progress: i === 0
            ? {
                current_time_seconds: 40,
                duration_seconds: 180,
                completed_at: null,
                updated_at: new Date().toISOString(),
            }
            : undefined,
    });
});
export var collections = [
    {
        id: "20000000-0000-4000-8000-000000000001",
        title: "Little Makers",
        description: "Make and discover",
        video_ids: [videos[0].id, videos[2].id],
    },
];
export var dashboard = {
    profiles: profiles,
    videos: videos,
    collections: collections,
    requests: [
        {
            id: "30000000-0000-4000-8000-000000000001",
            profile_id: profiles[1].id,
            display_name: "Ari",
            kind: "topic",
            message: "Lego trains",
            status: "pending",
            created_at: new Date().toISOString(),
        },
    ],
    familyCode: "synthetic-household-code",
    workflow: {
        approvedVideos: 3,
        activeChildren: 4,
        assignedVideos: 3,
        unassignedVideos: 0,
        openRequests: 1,
        byChild: profiles.map(function (p) { return ({
            profile_id: p.id,
            assignedVideos: p.display_name === "Ari" ? 3 : 0,
            openRequests: p.display_name === "Ari" ? 1 : 0,
        }); }),
        source: "WatchNest approval, assignment and request activity. Not YouTube watch or engagement metrics.",
    },
    analytics: {
        todaySeconds: 240,
        weekSeconds: 1200,
        byChild: profiles.map(function (p) { return ({
            profile_id: p.id,
            display_name: p.display_name,
            todaySeconds: p.display_name === "Ari" ? 240 : 0,
            weekSeconds: p.display_name === "Ari" ? 1200 : 0,
            recent: p.display_name === "Ari" ? [videos[0]] : [],
        }); }),
        popular: [{ title: videos[0].title, seconds: 1200 }],
        daily: Array.from({ length: 7 }, function (_, i) { return ({
            date: "2026-09-".concat(24 + i),
            seconds: i * 60,
        }); }),
        neverWatched: 2,
    },
    attention: [],
};
/** Browser-only synthetic API fixture. This tests rendered UI, never production persistence/auth. */
export function fixture(page_1, role_1) {
    return __awaiter(this, arguments, void 0, function (page, role, mode) {
        var mutations;
        var _this = this;
        if (mode === void 0) { mode = "standard"; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    mutations = [];
                    return [4 /*yield*/, page.route("**/api/**", function (route) { return __awaiter(_this, void 0, void 0, function () {
                            var url, path, method, body, response;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        url = new URL(route.request().url());
                                        path = url.pathname;
                                        method = route.request().method();
                                        body = route.request().postDataJSON();
                                        if (method !== "GET")
                                            mutations.push({ path: path, body: body });
                                        response = { ok: true };
                                        if (path === "/api/session")
                                            response = {
                                                role: role,
                                                configured: true,
                                                profile: __assign(__assign({}, profiles[1]), { experience_mode: mode }),
                                                parent: { email: "synthetic@example.test", parent_pin_set: true },
                                            };
                                        else if (path === "/api/auth/device")
                                            response = { profiles: profiles, parent_pin_set: true };
                                        else if (path === "/api/parent/dashboard")
                                            response = dashboard;
                                        else if (path === "/api/parent/session-status")
                                            response = {
                                                serverNow: new Date().toISOString(),
                                                profiles: profiles.map(function (profile) { return (__assign(__assign({}, profile), { access: { enabled: false, allowed: true, state: "unlimited", remainingSeconds: null, pausedSeconds: null, revision: 0, expiresAt: null }, devices: [] })); }),
                                            };
                                        else if (path === "/api/auth/children")
                                            response = { profiles: profiles };
                                        else if (path === "/api/auth/child")
                                            response = { profile: profiles[1] };
                                        else if (path === "/api/child/library")
                                            response = {
                                                profile: __assign(__assign({}, profiles[1]), { experience_mode: mode }),
                                                videos: videos,
                                                collections: collections,
                                            };
                                        else if (path === "/api/child/player")
                                            response = {
                                                profile: profiles[1],
                                                video: videos[0],
                                                next: videos[1],
                                                safe_playback_enabled: true,
                                            };
                                        else if (path === "/api/child/requests" && method === "GET")
                                            response = { requests: [] };
                                        else if (path === "/api/parent/settings")
                                            response = {
                                                parent_pin_set: true,
                                                timezone: "America/New_York",
                                                safe_playback_enabled: true,
                                            };
                                        else if (path === "/api/parent/videos/search" ||
                                            path === "/api/parent/videos/lookup")
                                            response = { videos: videos, errors: [] };
                                        else if (path === "/api/parent/collections")
                                            response = { collections: collections, ok: true };
                                        return [4 /*yield*/, route.fulfill({
                                                status: 200,
                                                contentType: "application/json",
                                                body: JSON.stringify(response),
                                            })];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                case 1:
                    _a.sent();
                    return [2 /*return*/, mutations];
            }
        });
    });
}

import { useState, useEffect, useRef, useCallback } from "react";

interface DiscordUser {
  id: string;
  username: string;
  global_name: string;
  discriminator: string;
  avatar: string;
  banner: string | null;
  accent_color: number | null;
  avatar_decoration_data?: {
    asset: string;
    sku_id: string;
    expires_at: number | null;
  };
}

interface SpotifyData {
  song: string;
  artist: string;
  album: string;
  album_art_url: string;
  track_id: string;
  timestamps: {
    start: number;
    end: number;
  };
}

interface DiscordActivity {
  type: number;
  name: string;
  state?: string;
  details?: string;
  application_id?: string;
  assets?: {
    large_image?: string;
    large_text?: string;
    small_image?: string;
    small_text?: string;
  };
  timestamps?: {
    start?: number;
    end?: number;
  };
}

interface DiscordPresence {
  status: "online" | "idle" | "dnd" | "offline";
  activities: DiscordActivity[];
  listening_to_spotify: boolean;
  spotify: SpotifyData | null;
  active: boolean;
  updated_at: string;
  last_seen?: string;
}

interface GuildData {
  id: string;
  name: string;
  icon: string;
  approximate_member_count: number;
  approximate_presence_count: number;
  instant_invite?: string;
}

interface Track {
  title: string;
  artist: string;
  art: string;
  src: string;
}

const SONGS: Track[] = [
  { title: "Struct", artist: "UdieNnx", art: "/media/covers/struct.jpg", src: "/media/audio/struct.mp3" },
  { title: "Majboor", artist: "Sheheryar Rehan, Zoha Waseem", art: "/media/covers/majboor.jpg", src: "/media/audio/majboor.mp3" },
  { title: "Her", artist: "Jvke", art: "/media/covers/her.jpg", src: "/media/audio/her.mp3" },
  { title: "Peligrosa", artist: "FloyyMenor", art: "/media/covers/peligrosa.jpg", src: "/media/audio/peligrosa.mp3" },
  { title: "Tauba", artist: "Shibu", art: "/media/covers/tauba.jpg", src: "/media/audio/tauba.mp3" },
  { title: "Parano", artist: "Frozy", art: "/media/covers/parano.jpg", src: "/media/audio/parano.mp3" }
];

const BADGES = [
  { id: "owner", label: "Owner", icon: "fa-solid fa-crown", color: "#ffd700" },
  { id: "flame", label: "Flame", icon: "fa-solid fa-fire", color: "#ff9f43" },
  { id: "anime", label: "Anime", icon: "fa-solid fa-tv", color: "#ff6b9d" },
  { id: "music", label: "Music", icon: "fa-brands fa-soundcloud", color: "#ff5500" },
  { id: "verified", label: "Verified", icon: "fa-solid fa-circle-check", color: "#3498db" },
  { id: "code", label: "Coder", icon: "fa-solid fa-code", color: "#2ecc71" }
];

const SOCIAL_LINKS = [
  { href: "https://github.com/itzzzdark", icon: "fa-brands fa-github", label: "GitHub" },
  { href: "https://youtube.com/@lowx5", icon: "fa-brands fa-youtube", label: "YouTube" },
  { href: "https://discord.gg/NqKTxrm2VV", icon: "fa-brands fa-discord", label: "Discord", useInvite: true },
  { href: "https://www.instagram.com/hx_nst", icon: "fa-brands fa-instagram", label: "Instagram" },
  { href: "https://t.me/itzzz_dark", icon: "fa-brands fa-telegram", label: "Telegram" }
];

const TYPEWRITER_MESSAGES = [
  "I don't chase light. I become it in the dark.",
  "Walk alone. Win alone. Smile later.",
  "The story isn't over. I'm just entering my strongest arc.",
  "Building ideas. Breaking limits. Creating tomorrow.",
  "Born to disappear. Destined to be remembered."
];

function SnowCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animId = 0;
    let active = true;
    let particles: Array<{
      x: number;
      y: number;
      r: number;
      s: number;
      drift: number;
      phase: number;
    }> = [];

    const isMobile = window.matchMedia("(max-width: 640px)").matches;
    const particleCount = isMobile ? 28 : 42;

    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const createParticle = (atTop = false) => ({
      x: Math.random() * window.innerWidth,
      y: atTop ? Math.random() * window.innerHeight : -8,
      r: 0.7 + 1.8 * Math.random(),
      s: 0.35 + 0.85 * Math.random(),
      drift: -0.35 + 0.7 * Math.random(),
      phase: Math.random() * Math.PI * 2,
    });

    resizeCanvas();

    for (let i = 0; i < particleCount; i++) {
      particles.push(createParticle(true));
    }

    const animate = () => {
      if (!active) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "rgba(255, 255, 255, 0.85)";

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.phase += 0.01;
        p.y += p.s;
        p.x += p.drift + 0.15 * Math.sin(p.phase);

        if (p.y > h + 6) {
          particles[i] = createParticle(false);
        } else if (p.x < -6) {
          p.x = w + 4;
        } else if (p.x > w + 6) {
          p.x = -4;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, 2 * Math.PI);
        ctx.fill();
      }
      animId = requestAnimationFrame(animate);
    };

    const handleVisibilityChange = () => {
      active = document.visibilityState === "visible";
      if (active) {
        animId = requestAnimationFrame(animate);
      } else {
        cancelAnimationFrame(animId);
      }
    };

    const handleResize = () => {
      resizeCanvas();
    };

    window.addEventListener("resize", handleResize, { passive: true });
    document.addEventListener("visibilitychange", handleVisibilityChange);
    animId = requestAnimationFrame(animate);

    return () => {
      active = false;
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return <canvas ref={canvasRef} className="snow" aria-hidden="true" />;
}

function useTypewriter(words: string[], typingSpeed = 80, deletingSpeed = 45, delay = 2200) {
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (index >= words.length) return;

    if (subIndex === words[index].length + 1 && !isDeleting) {
      const timeout = setTimeout(() => setIsDeleting(true), delay);
      return () => clearTimeout(timeout);
    }

    if (subIndex === 0 && isDeleting) {
      setIsDeleting(false);
      setIndex((prev) => (prev + 1) % words.length);
      return;
    }

    const timeout = setTimeout(() => {
      setSubIndex((prev) => prev + (isDeleting ? -1 : 1));
    }, isDeleting ? deletingSpeed : typingSpeed);

    return () => clearTimeout(timeout);
  }, [subIndex, isDeleting, index, words, typingSpeed, deletingSpeed, delay]);

  return words[index].substring(0, subIndex);
}

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? "0" : ""}${s}`;
}

export default function App() {
  const [entered, setEntered] = useState(false);
  const [views, setViews] = useState<number>(0);
  
  const [discordUser, setDiscordUser] = useState<DiscordUser | null>(null);
  const [presence, setPresence] = useState<DiscordPresence | null>(null);
  const [guildData, setGuildData] = useState<GuildData | null>(null);
  const [loadingDiscord, setLoadingDiscord] = useState(true);

  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);

  const currentTrack = SONGS[currentTrackIndex];
  const typewriterText = useTypewriter(TYPEWRITER_MESSAGES);

  const discordUserId = import.meta.env.VITE_DISCORD_USER_ID || "1186206505658220597";
  const discordGuildId = import.meta.env.VITE_DISCORD_GUILD_ID || "";

  useEffect(() => {
    let counted = false;
    try {
      counted = sessionStorage.getItem("pv_hit") === "1";
    } catch {
      counted = false;
    }

    if (!counted) {
      try {
        sessionStorage.setItem("pv_hit", "1");
      } catch {}
      fetch("/api/views", { method: "POST", credentials: "same-origin" })
        .then((res) => res.json())
        .then((data) => {
          if (typeof data.views === "number") {
            setViews(data.views);
          }
        })
        .catch(() => {
          fetchViewsOnly();
        });
    } else {
      fetchViewsOnly();
    }
  }, []);

  const fetchViewsOnly = () => {
    fetch("/api/views")
      .then((res) => res.json())
      .then((data) => {
        if (typeof data.views === "number") {
          setViews(data.views);
        }
      })
      .catch(() => {
        setViews(1024);
      });
  };

  const fetchDiscord = useCallback(() => {
    const userQuery = `?id=${encodeURIComponent(discordUserId)}`;
    
    fetch(`/api/discord${userQuery}`)
      .then((res) => res.json())
      .then((data) => {
        setDiscordUser(data);
      })
      .catch(() => {
      })
      .finally(() => setLoadingDiscord(false));

    fetch(`/api/discord/presence${userQuery}`)
      .then((res) => res.json())
      .then((data) => {
        setPresence(data);
      })
      .catch(() => {});

    if (discordGuildId) {
      fetch(`/api/discord/guild?id=${encodeURIComponent(discordGuildId)}`)
        .then((res) => res.json())
        .then((data) => {
          if (!data.error) {
            setGuildData(data);
          }
        })
        .catch(() => {});
    }
  }, [discordUserId, discordGuildId]);

  useEffect(() => {
    fetchDiscord();
    const interval = setInterval(fetchDiscord, 10000); // refresh presence every 10 seconds
    return () => clearInterval(interval);
  }, [fetchDiscord]);

  useEffect(() => {
    if (!audioRef.current) return;
    
    const audio = audioRef.current;
    
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      handleNextTrack();
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [currentTrackIndex]);

  useEffect(() => {
    if (!audioRef.current) return;
    if (entered && isPlaying) {
      audioRef.current.play().catch(() => {
        setIsPlaying(false);
      });
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, entered]);

  const togglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  const handleNextTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % SONGS.length);
    setIsPlaying(true);
  };

  const handlePrevTrack = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + SONGS.length) % SONGS.length);
    setIsPlaying(true);
  };

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !audioRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const clickRatio = Math.max(0, Math.min(1, clickX / width));
    const newTime = clickRatio * duration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleEnterSite = () => {
    setEntered(true);
    setIsPlaying(true);
  };

  const currentStatus = presence?.status || "offline";
  const statusLabels = {
    online: "Online",
    idle: "Idle",
    dnd: "Do Not Disturb",
    offline: "Offline",
  };

  const statusColors = {
    online: "is-online",
    idle: "is-idle",
    dnd: "is-dnd",
    offline: "is-offline",
  };

  const renderActivity = () => {
    if (!presence) return null;

    if (presence.listening_to_spotify && presence.spotify) {
      const sp = presence.spotify;
      const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
      
      const startTime = sp.timestamps.start;
      const endTime = sp.timestamps.end;
      const now = Date.now();
      const spotifyProgressPercent = endTime > startTime 
        ? Math.max(0, Math.min(100, ((now - startTime) / (endTime - startTime)) * 100))
        : 0;

      return (
        <div className="player" style={{ marginBottom: "16px" }}>
          <div className="player-top">
            <img 
              className="player-art is-playing" 
              src={sp.album_art_url} 
              alt={sp.album} 
              draggable="false"
              referrerPolicy="no-referrer"
            />
            <div className="player-meta">
              <div className="player-now">
                <i className="fa-brands fa-spotify" style={{ color: "#1DB954" }}></i>
                <span>Listening to Spotify</span>
              </div>
              <div className="player-title">
                <a 
                  href={`https://open.spotify.com/track/${sp.track_id}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  {sp.song}
                </a>
              </div>
              <div className="player-artist">{sp.artist}</div>
            </div>
            {}
            <div className="eq is-on">
              <span style={{ "--d": "0.5s", "--h": "18px" } as React.CSSProperties}></span>
              <span style={{ "--d": "0.7s", "--h": "12px" } as React.CSSProperties}></span>
              <span style={{ "--d": "0.4s", "--h": "16px" } as React.CSSProperties}></span>
              <span style={{ "--d": "0.65s", "--h": "10px" } as React.CSSProperties}></span>
            </div>
          </div>
          <div className="seek-wrap" style={{ marginBottom: 0 }}>
            <div className="bar">
              <div className="bar-fill" style={{ width: `${spotifyProgressPercent}%` }}></div>
            </div>
          </div>
        </div>
      );
    }

    const game = presence.activities.find((a) => a.type === 0 || a.type === 3 || a.type === 4);
    if (game) {
      const largeImage = game.assets?.large_image;
      const hasLargeImage = largeImage && largeImage.startsWith("mp:external");
      const appImageSrc = largeImage 
        ? (largeImage.startsWith("mp:") 
            ? `https://media.discordapp.net/external/${largeImage.replace("mp:", "")}`
            : `https://cdn.discordapp.com/app-assets/${game.application_id}/${largeImage}.png`)
        : null;

      return (
        <div className="guild" style={{ marginBottom: "16px", cursor: "default" }}>
          {appImageSrc ? (
            <img 
              className="guild-icon" 
              src={appImageSrc} 
              alt={game.name} 
              draggable="false" 
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="guild-icon flex items-center justify-center bg-white/5 border border-white/10 text-white/50 text-xl">
              <i className={game.type === 4 ? "fa-solid fa-message" : "fa-solid fa-gamepad"}></i>
            </div>
          )}
          <div className="guild-meta">
            <div className="player-now" style={{ fontSize: "0.58rem" }}>
              <i className="fa-solid fa-gamepad" style={{ color: "var(--green)" }}></i>
              <span>Playing</span>
            </div>
            <div className="guild-name">{game.name}</div>
            <div className="guild-stats">
              {game.details && <span>{game.details}</span>}
              {game.state && <span className="opacity-80"> · {game.state}</span>}
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  const avatarDecoUrl = discordUser?.avatar_decoration_data?.asset
    ? `https://cdn.discordapp.com/avatar-decoration-presets/${discordUser.avatar_decoration_data.asset}.png`
    : null;

  return (
    <div className="page">
      {}
      <button 
        type="button" 
        className={`enter-screen ${entered ? "fade-out" : ""}`} 
        onClick={handleEnterSite}
        aria-label="Tap to enter"
      >
        <span className="enter-label">tap to enter</span>
      </button>

      {}
      <div className="bg" aria-hidden="true">
        <img className="bg-media bg-fill" src="/media/background/bg.jpg" alt="" draggable="false" />
        {entered && (
          <video 
            className="bg-media bg-video animate-fade-in" 
            src="/media/background/car.mp4" 
            poster="/media/background/bg.jpg" 
            autoPlay 
            muted 
            loop 
            playsInline 
            preload="auto"
            disablePictureInPicture
          ></video>
        )}
      </div>

      {}
      <SnowCanvas />

      {}
      <main className={`stage transition-all duration-1000 ${entered ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
        <article className="card">
          
          {}
          <div className="views" title="Unique visitors — refresh does not count again">
            <i className="fa-solid fa-eye"></i>
            <span>{views}</span>
            <span className="views-label">views</span>
          </div>

          {}
          <div className={`avatar-wrap ${statusColors[currentStatus]}`}>
            <div className="avatar-core">
              <img 
                className="avatar" 
                src={discordUser?.avatar 
                  ? `https://cdn.discordapp.com/avatars/${discordUserId}/${discordUser.avatar}.png` 
                  : "https://i.ibb.co.com/v4dhZpv8/Dark.jpg"
                } 
                alt="Profile Avatar"
                referrerPolicy="no-referrer"
              />
            </div>
            {avatarDecoUrl && (
              <img 
                className="avatar-deco absolute pointer-events-none" 
                src={avatarDecoUrl} 
                alt="Avatar Decoration" 
                style={{
                  top: "50%",
                  left: "50%",
                  width: "var(--deco-size)",
                  height: "var(--deco-size)",
                  transform: "translate(-50%, -50%)",
                  zIndex: 2
                }}
                draggable="false"
                referrerPolicy="no-referrer"
              />
            )}
            
            {}
            <span className={`status-badge ${statusColors[currentStatus]}`} title={statusLabels[currentStatus]} aria-label={statusLabels[currentStatus]}>
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <defs>
                  <mask id="st-off">
                    <rect width="16" height="16" fill="#fff" />
                    <circle cx="8" cy="8" r="4.15" fill="#000" />
                  </mask>
                </defs>
                <circle cx="8" cy="8" r="8" mask="url(#st-off)" />
              </svg>
            </span>
          </div>

          {}
          <h1 className="name neon">
            <span>{discordUser?.global_name || "Dark"}</span>
          </h1>

          {}
          <p className="handle">
            <span>@{discordUser?.username || "0itzdark"}</span>
            <span className={`status-text ${statusColors[currentStatus]}`}>
              {currentStatus !== "offline" && <i className="live-dot" />}
              {statusLabels[currentStatus]}
            </span>
          </p>

          {}
          {currentStatus === "offline" && (
            <p className="last-seen">
              <i className="fa-regular fa-clock" />
              <span>Last seen</span>
              <strong>{presence?.last_seen ? new Date(presence.last_seen).toLocaleDateString() : "Recently"}</strong>
            </p>
          )}

          {}
          <div className="badges">
            {BADGES.map((b) => (
              <span 
                key={b.id} 
                className="badge badge-custom" 
                title={b.label} 
                style={{ "--badge-color": b.color } as React.CSSProperties}
              >
                <i className={b.icon} aria-hidden="true"></i>
              </span>
            ))}
          </div>

          {}
          <p className="bio">
            <span>{typewriterText}</span>
            <span className="caret" />
          </p>

          {}
          {renderActivity()}

          {}
          {guildData && (
            <a 
              href={guildData.instant_invite || "https://discord.gg/NqKTxrm2VV"} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="guild"
            >
              <img 
                className="guild-icon" 
                src={guildData.icon 
                  ? `https://cdn.discordapp.com/icons/${guildData.id}/${guildData.icon}.png` 
                  : "https://i.ibb.co.com/v4dhZpv8/Dark.jpg"
                } 
                alt={guildData.name} 
                draggable="false"
                referrerPolicy="no-referrer"
              />
              <div className="guild-meta">
                <div className="guild-name">{guildData.name}</div>
                <div className="guild-stats">
                  <span className="online-dot">
                    <span className="live-dot" />
                    {guildData.approximate_presence_count.toLocaleString()} Online
                  </span>
                  <span className="opacity-70">
                    {guildData.approximate_member_count.toLocaleString()} Members
                  </span>
                </div>
              </div>
              <span className="guild-join">Join</span>
            </a>
          )}

          {}
          <div className="socials">
            {SOCIAL_LINKS.map((s) => (
              <a 
                key={s.label}
                href={s.href} 
                className="social" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label={s.label} 
                title={s.label}
              >
                <i className={s.icon} />
              </a>
            ))}
          </div>

          {}
          <div className="player">
            <audio 
              ref={audioRef} 
              src={currentTrack.src} 
              preload="auto" 
              playsInline
            />
            <div className="player-top">
              <img 
                className={`player-art ${isPlaying ? "is-playing" : ""}`} 
                src={currentTrack.art} 
                alt="" 
                draggable="false"
              />
              <div className="player-meta">
                <div className="player-now">
                  {isPlaying && <i className="live-dot" />}
                  <span>{isPlaying ? "Now Playing" : "Paused"}</span>
                </div>
                <div className="player-title">{currentTrack.title}</div>
                <div className="player-artist">{currentTrack.artist}</div>
              </div>
              
              {}
              <div className={`eq ${isPlaying ? "is-on" : ""}`}>
                <span style={{ "--d": "0.5s", "--h": "18px" } as React.CSSProperties}></span>
                <span style={{ "--d": "0.7s", "--h": "12px" } as React.CSSProperties}></span>
                <span style={{ "--d": "0.4s", "--h": "16px" } as React.CSSProperties}></span>
                <span style={{ "--d": "0.65s", "--h": "10px" } as React.CSSProperties}></span>
              </div>
            </div>

            {}
            <div className="seek-wrap">
              <div 
                ref={progressBarRef}
                className="bar" 
                onClick={handleProgressBarClick}
                role="presentation"
              >
                <div 
                  className="bar-fill" 
                  style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                ></div>
              </div>
              <div className="seek-times">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {}
            <div className="controls">
              <button 
                type="button" 
                className="ctrl" 
                onClick={handlePrevTrack} 
                aria-label="Previous Track"
              >
                <i className="fa-solid fa-backward-step"></i>
              </button>
              <button 
                type="button" 
                className="ctrl ctrl-main" 
                onClick={togglePlay} 
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                <i className={`fa-solid ${isPlaying ? "fa-pause" : "fa-play"}`}></i>
              </button>
              <button 
                type="button" 
                className="ctrl" 
                onClick={handleNextTrack} 
                aria-label="Next Track"
              >
                <i className="fa-solid fa-forward-step"></i>
              </button>
            </div>
          </div>
        </article>

        {}
        <p className="footer">
          <span className="sig">Dark</span>
        </p>
      </main>
    </div>
  );
}

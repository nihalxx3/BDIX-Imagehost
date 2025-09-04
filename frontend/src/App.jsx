
import React, { useRef, useState } from "react";
import axios from "axios";
import { GeistProvider, CssBaseline, Page, Text, Button, Input, Card, Spacer, useToasts, Image, Link, Grid, useTheme } from "@geist-ui/core";
import { Upload as UploadIcon, Copy as CopyIcon } from "@geist-ui/icons";

const API_URL = "http://localhost:29911/upload";

export default function App() {
  const fileInput = useRef();
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [status, setStatus] = useState("");
  const [themeType, setThemeType] = useState(() => {
    // Default to light, but check localStorage
    const saved = window.localStorage.getItem("themeType");
    return saved === "dark" ? "dark" : "light";
  });
  const { setToast } = useToasts();

  // Save theme preference to localStorage
  const setTheme = (type) => {
    setThemeType(type);
    window.localStorage.setItem("themeType", type);
  };

  const handleFile = async (file) => {
    if (!file) return;
    setStatus("Uploading...");
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await axios.post(API_URL, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setImageUrl(res.data.url);
      setImage(URL.createObjectURL(file));
      setStatus("");
      setToast({ text: "Image URL copied to clipboard!", type: "success" });
      navigator.clipboard.writeText(res.data.url);
    } catch (e) {
      setStatus("Upload failed.");
      setToast({ text: "Upload failed.", type: "error" });
    }
  };

  const onFileChange = (e) => {
    handleFile(e.target.files[0]);
  };

  const onPaste = (e) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const file = items[i].getAsFile();
        handleFile(file);
        break;
      }
    }
  };

  const onCopy = () => {
    if (imageUrl) {
      navigator.clipboard.writeText(imageUrl);
      setToast({ text: "Copied to clipboard!", type: "success" });
    }
  };

  return (
    <GeistProvider themeType={themeType}>
      <CssBaseline />
  <Page dotBackdrop tabIndex={0} onPaste={onPaste} style={{ minHeight: "100vh", padding: 0, display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <header
          style={{
            width: "100%",
            background: themeType === "dark" ? "#111" : "#d7d7d74e",
            boxShadow: "0 2px 8px #eee",
              textAlign: "center",
              margin: 0,
              padding: 0,
            top: 0,
            left: 0,
            zIndex: 100
          }}
        >
          <Grid.Container gap={2} justify="space-between" alignItems="center" style={{ maxWidth: 600, margin: "0 auto" }}>
            <Grid><Text h3 style={{ margin: 0, color: "#2d7be5" }}>Pass The Image (PTI)</Text></Grid>
            <Grid>
              <nav style={{ display: "flex", alignItems: "center" }}>
                <Link href="#" style={{ marginRight: 16 }}>Home</Link>
                <Link href="#" style={{ marginRight: 16 }}>Contact Us</Link>
                <Button auto size="mini" type="secondary" onClick={() => setTheme(themeType === "dark" ? "light" : "dark")}
                  style={{ marginLeft: 8 }}>
                  {themeType === "dark" ? "Light Mode" : "Dark Mode"}
                </Button>
              </nav>
            </Grid>
          </Grid.Container>
        </header>
  <Grid.Container justify="center" alignItems="center" style={{ flex: 1, padding: "0 8px", marginTop: 56, marginBottom: 56 }}>
          <Grid xs={24} sm={20} md={16} lg={8} style={{ width: "100%" }}>
            <Card shadow width="100%" style={{ maxWidth: 420, margin: "0 auto", padding: "16px 8px" }}>
              <Text h2 style={{ textAlign: "center", color: themeType === "dark" ? "#fff" : "#000" }}>Upload image here</Text>
              <Spacer h={1} />
              <Button icon={<UploadIcon />} type="secondary" auto onClick={() => fileInput.current.click()} style={{ width: "100%" }}>
                Select Image
              </Button>
              <input
                type="file"
                accept="image/png, image/jpeg, image/jpg, image/gif"
                ref={fileInput}
                style={{ display: "none" }}
                onChange={onFileChange}
              />
              <Text small style={{ color: themeType === "dark" ? "#bbb" : "#888", margin: "10px 0" }}>or paste image from clipboard</Text>
              <Spacer h={1} />
              {image && (
                <>
                  <Image src={image} alt="preview" style={{ borderRadius: 8, boxShadow: "0 1px 8px #eee" }} width="100%" />
                  <Spacer h={0.5} />
                  <Button icon={<CopyIcon />} type="success" auto onClick={onCopy} style={{ width: "100%" }}>
                    Copy Image URL
                  </Button>
                </>
              )}
              {imageUrl && (
                <div style={{ marginTop: 10, textAlign: "center", wordBreak: "break-all" }}>
                  <Link href={imageUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: "1rem" }}>
                    {imageUrl}
                  </Link>
                </div>
              )}
              {status && <Text small type="error">{status}</Text>}
            </Card>
          </Grid>
        </Grid.Container>
        {/* Footer */}
        <footer
          style={{
            width: "100%",
            background: themeType === "dark" ? "#111" : "#fff",
            boxShadow: "0 -2px 8px #eee",
            padding: 0,
            position: "fixed",
            left: 0,
            bottom: 0,
            zIndex: 100
          }}
        >
          <Text small style={{ color: themeType === "dark" ? "#bbb" : "#888" }}>
            <span style={{ width: '100%', display: 'inline-block', textAlign: 'center' }}>
              Copyright reserved by nihalxx3 &copy; 2025
            </span>
          </Text>
        </footer>
        {/* Responsive styles */}
        <style>{`
          @media (max-width: 600px) {
            .geist-ui-page {
              padding: 0 !important;
            }
            .geist-ui-card {
              max-width: 98vw !important;
              margin: 0 auto !important;
              padding: 8px 2px !important;
            }
            header, footer {
              padding-left: 2vw !important;
              padding-right: 2vw !important;
            }
          }
        `}</style>
      </Page>
    </GeistProvider>
  );
}


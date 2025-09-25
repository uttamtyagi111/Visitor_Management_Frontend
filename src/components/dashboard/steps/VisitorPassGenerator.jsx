import React, { useCallback } from "react";
import { visitorAPI } from "../../../api/visitor";
import { useToast } from "../../../contexts/ToastContext";

// Pass generation and download functionality component
export const useVisitorPassGenerator = ({
  visitors,
  setVisitors,
  selectedVisitor,
  setSelectedVisitor,
  setUpdating,
  setError,
  fetchVisitors,
  user,
  setPassVisitor,
  setShowPassModal,
  passVisitor,
}) => {
  const generatePassImage = async (visitor) => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      // Set canvas size
      canvas.width = 400;
      canvas.height = 600;

      // Create gradient background
      const gradient = ctx.createLinearGradient(0, 0, 400, 600);
      gradient.addColorStop(0, "#3B82F6");
      gradient.addColorStop(1, "#8B5CF6");

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 400, 600);

      // Add company header
      ctx.fillStyle = "white";
      ctx.font = "bold 24px Arial";
      ctx.textAlign = "center";
      ctx.fillText("VISITOR PASS", 200, 50);

      ctx.font = "16px Arial";
      ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
      ctx.fillText("Wish Geeks Techserve", 200, 80);

      const drawPassContent = (img = null) => {
        // Redraw the pass content
        if (img) {
          // Create a circular mask for the image
          ctx.save();
          ctx.beginPath();
          ctx.arc(200, 170, 50, 0, Math.PI * 2);
          ctx.closePath();
          ctx.clip();

          // Draw the image
          ctx.drawImage(img, 150, 120, 100, 100);
          ctx.restore();

          // Add white border
          ctx.beginPath();
          ctx.arc(200, 170, 50, 0, Math.PI * 2);
          ctx.strokeStyle = "white";
          ctx.lineWidth = 4;
          ctx.stroke();
        } else {
          // Fallback to placeholder if no image
          ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
          ctx.beginPath();
          ctx.arc(200, 170, 50, 0, Math.PI * 2);
          ctx.fill();

          // Add initial letter
          const initials =
            (visitor.name || visitor.firstName || "V").charAt(0).toUpperCase() +
            (visitor.lastName || "").charAt(0).toUpperCase();
          ctx.fillStyle = "white";
          ctx.font = "bold 24px Arial";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(initials, 200, 170);
        }

        // Add visitor details
        ctx.fillStyle = "white";
        ctx.font = "bold 20px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "alphabetic";
        ctx.fillText(
          visitor.name ||
            `${visitor.firstName || ""} ${visitor.lastName || ""}`.trim(),
          200,
          260
        );

        ctx.font = "14px Arial";
        ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
        ctx.fillText(visitor.email || "", 200, 285);

        // Add visit details
        ctx.textAlign = "left";
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        ctx.fillText("Visit Time:", 50, 340);
        ctx.fillStyle = "white";
        ctx.fillText(new Date().toLocaleString(), 150, 340);

        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        ctx.fillText("Purpose:", 50, 370);
        ctx.fillStyle = "white";
        ctx.fillText(visitor.purpose || "General Visit", 150, 370);

        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        ctx.fillText("Status:", 50, 400);
        ctx.fillStyle = "white";
        ctx.fillText("Checked In", 150, 400);

        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        ctx.fillText("ID:", 50, 430);
        ctx.fillStyle = "white";
        ctx.fillText(`#${visitor.id}`, 150, 430);

        // Add footer
        ctx.textAlign = "center";
        ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
        ctx.font = "12px Arial";
        ctx.fillText(
          "Please wear this pass at all times during your visit",
          200,
          520
        );
        ctx.fillText(
          "Generated on: " + new Date().toLocaleDateString(),
          200,
          540
        );

        // Convert canvas to blob
        canvas.toBlob(
          (blob) => {
            resolve(blob);
          },
          "image/png",
          1.0
        );
      };

      // Try to load the visitor's image using fetch API first
      const loadImage = async () => {
        const imageUrl = visitor.image || visitor.imageUrl || visitor.photo;
        if (!imageUrl) {
          drawPassContent();
          return;
        }

        try {
          // First try using fetch to handle CORS properly
          const response = await fetch(imageUrl, {
            mode: "cors",
            cache: "no-cache",
          });

          if (!response.ok) {
            throw new Error("Image fetch failed");
          }

          const blob = await response.blob();
          const img = new Image();
          const blobUrl = URL.createObjectURL(blob);

          img.onload = () => {
            drawPassContent(img);
            URL.revokeObjectURL(blobUrl);
          };

          img.onerror = () => {
            console.error("Error loading image from blob");
            URL.revokeObjectURL(blobUrl);
            fallbackImageLoad();
          };

          img.src = blobUrl;
        } catch (error) {
          console.error("Error fetching image:", error);
          fallbackImageLoad();
        }
      };

      // Fallback method using direct image loading
      const fallbackImageLoad = () => {
        const imageUrl = visitor.image || visitor.imageUrl || visitor.photo;
        const img = new Image();

        // Add timestamp to prevent caching
        const timestamp = new Date().getTime();
        const urlWithTimestamp = imageUrl.includes("?")
          ? `${imageUrl}&t=${timestamp}`
          : `${imageUrl}?t=${timestamp}`;

        img.crossOrigin = "anonymous";
        img.onload = () => drawPassContent(img);
        img.onerror = () => {
          console.error("Fallback image load failed");
          drawPassContent(); // Draw without image
        };
        img.src = urlWithTimestamp;
      };

      // Start the image loading process
      loadImage();
    });
  };

  const handleGeneratePass = useCallback(
    async (visitorId) => {
      try {
        setUpdating(true);

        // Find the visitor
        const visitor = visitors.find((v) => v.id === visitorId);
        if (!visitor) {
          throw new Error("Visitor not found");
        }

        // Set the visitor for pass generation
        setPassVisitor(visitor);
        setShowPassModal(true);

        // Get current timestamp for check-in
        const checkInTime = new Date().toISOString();

        // Generate the pass image
        const passBlob = await generatePassImage(visitor);

        // Create a File object from the blob
        const passFile = new File(
          [passBlob],
          `visitor-pass-${visitor.id}.png`,
          { type: "image/png" }
        );

        // Prepare update data with check-in information
        const updateData = {
          status: "checked_in",
          pass_generated: true,
          checkInTime,
          hostName: user?.name || "System",
          checkedInBy: user?.name || "System",
          checkedInAt: checkInTime,
          updated_at: new Date().toISOString(),
          issued_by: user?.id || "System",
        };

        // Optimistic UI update
        setVisitors((prevVisitors) =>
          prevVisitors.map((v) =>
            v.id === visitorId ? { ...v, ...updateData } : v
          )
        );

        // Update selected visitor if it's the same one
        if (selectedVisitor && selectedVisitor.id === visitorId) {
          setSelectedVisitor((prev) => ({ ...prev, ...updateData }));
        }

        // Call API to update visitor with pass file
        await visitorAPI.updateVisitorStatus(visitorId, "checked_in", passFile);
        await visitorAPI.updateVisitor(visitorId, updateData, null, passFile);
      } catch (err) {
        console.error("Error generating pass:", err);
        setError(err.message);
        // Revert optimistic update on error
        fetchVisitors();
      } finally {
        setUpdating(false);
      }
    },
    [visitors, selectedVisitor, fetchVisitors, user?.name, setVisitors, setSelectedVisitor, setUpdating, setError, setPassVisitor, setShowPassModal]
  );

  // Pass download functionality
  const handleDownloadPass = useCallback(() => {
    if (!passVisitor) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    // Set canvas size
    canvas.width = 400;
    canvas.height = 600;

    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, 400, 600);
    gradient.addColorStop(0, "#3B82F6");
    gradient.addColorStop(1, "#8B5CF6");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 400, 600);

    // Add company header
    ctx.fillStyle = "white";
    ctx.font = "bold 24px Arial";
    ctx.textAlign = "center";
    ctx.fillText("VISITOR PASS", 200, 50);

    ctx.font = "16px Arial";
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    ctx.fillText("Wish Geeks Techserve", 200, 80);

    // Create a function to draw the pass with the image
    const drawPass = (img = null) => {
      // Clear and redraw background
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 400, 600);

      // Redraw header text
      ctx.fillStyle = "white";
      ctx.font = "bold 24px Arial";
      ctx.textAlign = "center";
      ctx.fillText("VISITOR PASS", 200, 50);

      ctx.font = "16px Arial";
      ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
      ctx.fillText("Wish Geeks Techserve", 200, 80);

      // Draw visitor image if available
      if (img) {
        // Create a circular mask for the image
        ctx.save();
        ctx.beginPath();
        ctx.arc(200, 170, 50, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();

        // Draw the image
        ctx.drawImage(img, 150, 120, 100, 100);
        ctx.restore();

        // Add white border
        ctx.beginPath();
        ctx.arc(200, 170, 50, 0, Math.PI * 2);
        ctx.strokeStyle = "white";
        ctx.lineWidth = 4;
        ctx.stroke();
      } else {
        // Fallback to placeholder if no image
        ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
        ctx.beginPath();
        ctx.arc(200, 170, 50, 0, Math.PI * 2);
        ctx.fill();

        // Add initial letter
        const initials =
          (passVisitor.name || passVisitor.firstName || "V")
            .charAt(0)
            .toUpperCase() +
          (passVisitor.lastName || "").charAt(0).toUpperCase();
        ctx.fillStyle = "white";
        ctx.font = "bold 24px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(initials, 200, 170);
      }

      // Add visitor details
      ctx.fillStyle = "white";
      ctx.font = "bold 20px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "alphabetic";
      ctx.fillText(
        passVisitor.name ||
          `${passVisitor.firstName || ""} ${passVisitor.lastName || ""}`.trim(),
        200,
        260
      );

      ctx.font = "14px Arial";
      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
      ctx.fillText(passVisitor.email || "", 200, 285);

      // Add visit details
      ctx.textAlign = "left";
      ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
      ctx.fillText("Visit Time:", 50, 340);
      ctx.fillStyle = "white";
      ctx.fillText(new Date().toLocaleString(), 150, 340);

      ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
      ctx.fillText("Purpose:", 50, 370);
      ctx.fillStyle = "white";
      ctx.fillText(passVisitor.purpose || "General Visit", 150, 370);

      ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
      ctx.fillText("Status:", 50, 400);
      ctx.fillStyle = "white";
      ctx.fillText(passVisitor.status || "Approved", 150, 400);

      ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
      ctx.fillText("ID:", 50, 430);
      ctx.fillStyle = "white";
      ctx.fillText(`#${passVisitor.id}`, 150, 430);

      // Add footer
      ctx.textAlign = "center";
      ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
      ctx.font = "12px Arial";
      ctx.fillText(
        "Please wear this pass at all times during your visit",
        200,
        520
      );
      ctx.fillText(
        "Generated on: " + new Date().toLocaleDateString(),
        200,
        540
      );

      // Convert to blob and download
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `visitor-pass-${
          passVisitor.name || passVisitor.firstName || "visitor"
        }-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, "image/png");
    };

    // Try to load the visitor's image using fetch API
    const loadImageWithFetch = async (url) => {
      try {
        console.log("Attempting to fetch image:", url);
        const response = await fetch(url, {
          mode: "cors",
          cache: "no-cache",
          credentials: "same-origin",
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);
        const img = new Image();

        img.onload = () => {
          console.log("Image loaded successfully via fetch");
          drawPass(img);
          // Clean up the object URL after the image is loaded
          URL.revokeObjectURL(imageUrl);
        };

        img.onerror = (e) => {
          console.error("Error creating image from blob:", e);
          drawPass();
          URL.revokeObjectURL(imageUrl);
        };

        img.src = imageUrl;
      } catch (error) {
        console.error("Error loading image with fetch:", error);
        // Fallback to regular image loading if fetch fails
        loadImageDirectly(url);
      }
    };

    // Fallback method using regular image loading
    const loadImageDirectly = (url) => {
      console.log("Trying direct image load for:", url);
      const img = new Image();

      img.onload = () => {
        console.log("Image loaded successfully with direct method");
        drawPass(img);
      };

      img.onerror = (e) => {
        console.error("Direct image load failed:", e);
        drawPass();
      };

      // Add timestamp to prevent caching
      const timestamp = new Date().getTime();
      const urlWithTimestamp = url.includes("?")
        ? `${url}&t=${timestamp}`
        : `${url}?t=${timestamp}`;

      img.crossOrigin = "anonymous";
      img.src = urlWithTimestamp;
    };

    // Get the image URL and start loading
    const imageUrl =
      passVisitor.image || passVisitor.imageUrl || passVisitor.photo;
    console.log("Image URL:", imageUrl);

    if (imageUrl) {
      // First try with fetch API, fallback to direct loading
      loadImageWithFetch(imageUrl);
    } else {
      console.log("No image URL available for visitor");
      // No image URL, draw without it
      drawPass();
    }
  }, [passVisitor]);

  return {
    generatePassImage,
    handleGeneratePass,
    handleDownloadPass,
  };
};

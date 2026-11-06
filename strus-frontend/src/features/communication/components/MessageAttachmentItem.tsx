
import React, { useEffect, useState } from 'react';
import {
  Download,
  FileText,
  Image as ImageIcon,
  LoaderCircle,
  AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { Button } from '../../../components/ui/Button';
import type { MessageAttachment } from '../types/communication.types';

interface Props {
  attachment: MessageAttachment;
}

export const MessageAttachmentItem: React.FC<Props> = ({
  attachment,
}) => {
  const [downloading, setDownloading] = useState(false);
  const [previewError, setPreviewError] = useState(false);

  const fileName =
    attachment.originalFileName ||
    attachment.fileName ||
    'Attachment';

  const isImage = attachment.mimeType.startsWith('image/');
  const isPdf = attachment.mimeType === 'application/pdf';
  const canPreview = isImage || isPdf;

  const fileSize = attachment.fileSize
    ? attachment.fileSize < 1024 * 1024
      ? `${(attachment.fileSize / 1024).toFixed(1)} KB`
      : `${(attachment.fileSize / (1024 * 1024)).toFixed(2)} MB`
    : 'Size unavailable';

  const downloadFile = async () => {
    try {
      setDownloading(true);

      const response = await fetch(attachment.url);

      if (!response.ok) {
        throw new Error('Unable to download attachment.');
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = fileName;

      document.body.appendChild(link);
      link.click();
      link.remove();

      // Delay revocation to allow the browser to start the download.
      window.setTimeout(() => {
        URL.revokeObjectURL(objectUrl);
      }, 1000);
    } catch {
      toast.error(
        'Download failed. The file may be unavailable or blocked by storage CORS settings.'
      );
    } finally {
      setDownloading(false);
    }
  };

  useEffect(() => {
    setPreviewError(false);
  }, [attachment.url]);

  return (
    <div
      style={{
        marginTop: 10,
        padding: 10,
        maxWidth: 420,
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        background: 'var(--color-surface)',
      }}
    >
      {/* File information */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        {isImage ? (
          <ImageIcon size={22} />
        ) : (
          <FileText size={22} />
        )}

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 'var(--text-sm)',
              fontWeight: 600,
              overflowWrap: 'anywhere',
            }}
          >
            {fileName}
          </div>

          <div
            style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-secondary)',
              marginTop: 3,
            }}
          >
            {attachment.mimeType} · {fileSize}
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={downloadFile}
          disabled={downloading}
        >
          {downloading ? (
            <LoaderCircle size={15} />
          ) : (
            <Download size={15} />
          )}
          {downloading ? 'Downloading…' : 'Download'}
        </Button>
      </div>

      {/* Image preview */}
      {isImage && !previewError && (
        <div
          style={{
            marginTop: 10,
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            background: 'var(--color-surface-subtle)',
          }}
        >
          <img
            src={attachment.url}
            alt={fileName}
            loading="lazy"
            onError={() => setPreviewError(true)}
            style={{
              display: 'block',
              width: '100%',
              maxHeight: 320,
              objectFit: 'contain',
            }}
          />
        </div>
      )}

      {/* PDF preview */}
      {isPdf && !previewError && (
        <div
          style={{
            marginTop: 10,
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            background: 'var(--color-surface-subtle)',
          }}
        >
          <iframe
            src={attachment.url}
            title={fileName}
            onError={() => setPreviewError(true)}
            style={{
              width: '100%',
              height: 360,
              border: 0,
              display: 'block',
            }}
          />
        </div>
      )}

      {/* Preview unavailable */}
      {canPreview && previewError && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginTop: 10,
            padding: 10,
            color: 'var(--color-text-secondary)',
            fontSize: 'var(--text-xs)',
          }}
        >
          <AlertCircle size={16} />
          Preview unavailable. You can still download this file.
        </div>
      )}
    </div>
  );
};

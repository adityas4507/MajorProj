import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { filesApi } from '../api/files';

export const useFiles = (folderId?: string) => {
  const queryClient = useQueryClient();

  const { data: fileList, isLoading, error } = useQuery({
    queryKey: ['files', folderId],
    queryFn: () => filesApi.list(folderId),
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => filesApi.upload(file, folderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files', folderId] });
      toast.success('File uploaded successfully');
    },
    onError: () => toast.error('Failed to upload file'),
  });

  const deleteMutation = useMutation({
    mutationFn: filesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files', folderId] });
      toast.success('File moved to trash');
    },
    onError: () => toast.error('Failed to delete file'),
  });

  const downloadMutation = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const blob = await filesApi.download(id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', name);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    },
    onError: () => toast.error('Failed to download file'),
  });

  return {
    folders: fileList?.folders || [],
    files: fileList?.files || [],
    isLoading,
    error,
    uploadFile: uploadMutation.mutate,
    isUploading: uploadMutation.isPending,
    deleteFile: deleteMutation.mutate,
    downloadFile: downloadMutation.mutate,
  };
};

export const useTrash = () => {
  const queryClient = useQueryClient();

  const { data: trashFiles, isLoading } = useQuery({
    queryKey: ['trash'],
    queryFn: filesApi.listTrash,
  });

  const restoreMutation = useMutation({
    mutationFn: filesApi.restore,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trash'] });
      toast.success('File restored');
    },
    onError: () => toast.error('Failed to restore file'),
  });

  const hardDeleteMutation = useMutation({
    mutationFn: filesApi.hardDelete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trash'] });
      toast.success('File permanently deleted');
    },
    onError: () => toast.error('Failed to delete file permanently'),
  });

  return {
    files: trashFiles || [],
    isLoading,
    restoreFile: restoreMutation.mutate,
    hardDeleteFile: hardDeleteMutation.mutate,
  };
};

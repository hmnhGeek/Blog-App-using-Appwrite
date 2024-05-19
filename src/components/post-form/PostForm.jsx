import React, { useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button, Input, RTE, Select } from "../index";
import bucketService from "../../appwrite/bucket";
import databaseService from "../../appwrite/db";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

function PostForm({ post }) {
  const { register, handleSubmit, watch, setValue, control, getValues } =
    useForm({
      defaultValues: {
        title: post?.title || "",
        slug: post?.slug || "",
        content: post?.content || "",
        status: post?.status || "active",
      },
    });

  const navigate = useNavigate();
  const userData = useSelector((state) => state.auth.userData);

  const submit = async (data) => {
    if (post) {
      // you are updating the post...
      let newImageForUpload = data?.image[0];
      const file = newImageForUpload
        ? bucketService.uploadFile(newImageForUpload)
        : null;

      // if a new image is uploaded, delete the old one
      if (file) {
        const deletedFile = bucketService.deleteFile(post.featuredImage);
      }

      // update the post now.
      // note that we are using $id in cases where appwrite is returing something.
      // even post is assumed to be returned from some appwrite service in the parent
      // component.
      let updatedPost = await databaseService.updatePost(post?.$id, {
        ...data,
        featuredImage: file ? file?.$id : post?.featuredImage,
      });

      if (updatedPost) navigate(`/post/${post?.$id}`);
    } else {
      // you are creating a new post.

      // upload the image
      let file = data.image[0] ? bucketService.uploadFile(data.image[0]) : null;

      // if an image was uploaded, then set the featuredImage property in data.
      if (file) {
        data.featuredImage = file?.$id;
      }

      // create the post
      let newPost = await databaseService.createPost({
        ...data,
        userId: userData?.$id,
      });

      if (newPost) navigate(`/post/${newPost?.$id}`);
    }
  };

  const slugTransform = useCallback((value) => {
    if (value && typeof value === "string") {
      return value
        .trim()
        .toLocaleLowerCase()
        .replace(/^[a-zA-Z\d\s]+/g, "-")
        .replace(/\s/g, "-");
    }
    return "";
  }, []);

  useEffect(() => {
    let subscription = watch((value, { name }) => {
      if (name === "title") {
        setValue("slug", slugTransform(value.title, { shouldValidate: true }));
      }
    });

    return () => subscription.unsubscribe();
  }, [watch, setValue, slugTransform]);

  return (
    <form onSubmit={handleSubmit(submit)} className="flex flex-wrap">
      <div className="w-2/3 px-2">
        <Input
          label="Title :"
          placeholder="Title"
          className="mb-4"
          {...register("title", { required: true })}
        />
        <Input
          label="Slug :"
          placeholder="Slug"
          className="mb-4"
          {...register("slug", { required: true })}
          onInput={(e) => {
            setValue("slug", slugTransform(e.currentTarget.value), {
              shouldValidate: true,
            });
          }}
        />
        <RTE
          label="Content :"
          name="content"
          control={control}
          defaultValue={getValues("content")}
        />
      </div>
      <div className="w-1/3 px-2">
        <Input
          label="Featured Image :"
          type="file"
          className="mb-4"
          accept="image/png, image/jpg, image/jpeg, image/gif"
          {...register("image", { required: !post })}
        />
        {post && (
          <div className="w-full mb-4">
            <img
              src={bucketService.getFilePreview(post.featuredImage)}
              alt={post.title}
              className="rounded-lg"
            />
          </div>
        )}
        <Select
          options={["active", "inactive"]}
          label="Status"
          className="mb-4"
          {...register("status", { required: true })}
        />
        <Button
          type="submit"
          bgColor={post ? "bg-green-500" : undefined}
          className="w-full"
        >
          {post ? "Update" : "Submit"}
        </Button>
      </div>
    </form>
  );
}

export default PostForm;

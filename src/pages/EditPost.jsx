import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Container, PostForm } from "../components";
import databaseService from "../appwrite/db";

function EditPost() {
  const [post, setPost] = useState(null);
  const { slug } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (slug) {
      databaseService.getPost(slug).then((post) => {
        if (post) setPost(post);
      });
    } else navigate("/");
  }, [slug, navigate]);

  if (post)
    return (
      <div className="py-8">
        <Container>
          <PostForm post={post} />
        </Container>
      </div>
    );

  return null;
}

export default EditPost;
